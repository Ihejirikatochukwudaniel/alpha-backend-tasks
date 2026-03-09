import { Repository } from 'typeorm';
import { CandidateSummariesWorker } from './candidate-summaries.worker';
import { CandidateSummary, CandidateSummaryStatus } from './entities/candidate-summary.entity';
import { CandidateDocument } from '../documents/entities/candidate-document.entity';
import { FakeSummarizationProvider } from '../../providers/summarization/fake-summarization.provider';

class InMemoryRepository<T extends { id: string }> implements Partial<Repository<T>> {
  items: T[] = [];

  async find(options?: any): Promise<T[]> {
    if (!options || !options.where) {
      return this.items;
    }
    return this.items.filter(item => {
      return Object.entries(options.where).every(([key, value]) => (item as any)[key] === value);
    });
  }

  async findOne(options: any): Promise<T | null> {
    const all = await this.find(options);
    return all[0] || null;
  }

  async save(entity: T): Promise<T> {
    const existingIndex = this.items.findIndex(item => item.id === entity.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = entity;
    } else {
      this.items.push(entity);
    }
    return entity;
  }
}

describe('CandidateSummariesWorker', () => {
  let summaryRepository: InMemoryRepository<CandidateSummary>;
  let documentRepository: InMemoryRepository<CandidateDocument>;
  let provider: FakeSummarizationProvider;
  let worker: CandidateSummariesWorker;

  beforeEach(() => {
    summaryRepository = new InMemoryRepository<CandidateSummary>();
    documentRepository = new InMemoryRepository<CandidateDocument>();
    provider = new FakeSummarizationProvider();
    worker = new CandidateSummariesWorker(
      summaryRepository as any,
      documentRepository as any,
      provider
    );
  });

  it('sets status to completed with fields populated when documents exist', async () => {
    const summary: CandidateSummary = {
      id: 'summary-1',
      candidateId: 'candidate-1',
      status: CandidateSummaryStatus.Pending,
      score: null,
      strengths: null,
      concerns: null,
      summary: null,
      recommendedDecision: null,
      provider: null,
      promptVersion: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    summaryRepository.items.push(summary);

    const document: CandidateDocument = {
      id: 'doc-1',
      candidateId: 'candidate-1',
      candidate: null as any,
      documentType: 'resume' as any,
      fileName: 'file.pdf',
      storageKey: 'key',
      rawText: 'text',
      uploadedAt: new Date()
    };
    documentRepository.items.push(document);

    await worker.handleGenerateCandidateSummary({
      data: { summaryId: 'summary-1', candidateId: 'candidate-1' }
    } as any);

    const updated = summaryRepository.items[0];
    expect(updated.status).toBe(CandidateSummaryStatus.Completed);
    expect(updated.score).not.toBeNull();
    expect(updated.summary).not.toBeNull();
    expect(updated.provider).toBe('gemini');
  });

  it('sets status to failed when no documents exist', async () => {
    const summary: CandidateSummary = {
      id: 'summary-2',
      candidateId: 'candidate-2',
      status: CandidateSummaryStatus.Pending,
      score: null,
      strengths: null,
      concerns: null,
      summary: null,
      recommendedDecision: null,
      provider: null,
      promptVersion: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    summaryRepository.items.push(summary);

    await worker.handleGenerateCandidateSummary({
      data: { summaryId: 'summary-2', candidateId: 'candidate-2' }
    } as any);

    const updated = summaryRepository.items[0];
    expect(updated.status).toBe(CandidateSummaryStatus.Failed);
    expect(updated.errorMessage).toBe('No documents found for candidate');
  });

  it('sets status to failed when provider throws error', async () => {
    const summary: CandidateSummary = {
      id: 'summary-3',
      candidateId: 'candidate-3',
      status: CandidateSummaryStatus.Pending,
      score: null,
      strengths: null,
      concerns: null,
      summary: null,
      recommendedDecision: null,
      provider: null,
      promptVersion: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    summaryRepository.items.push(summary);

    const document: CandidateDocument = {
      id: 'doc-3',
      candidateId: 'candidate-3',
      candidate: null as any,
      documentType: 'resume' as any,
      fileName: 'file.pdf',
      storageKey: 'key',
      rawText: 'text',
      uploadedAt: new Date()
    };
    documentRepository.items.push(document);

    const failingProvider = {
      generateCandidateSummary: jest.fn().mockRejectedValue(new Error('provider failure'))
    } as any;

    worker = new CandidateSummariesWorker(
      summaryRepository as any,
      documentRepository as any,
      failingProvider
    );

    await worker.handleGenerateCandidateSummary({
      data: { summaryId: 'summary-3', candidateId: 'candidate-3' }
    } as any);

    const updated = summaryRepository.items[0];
    expect(updated.status).toBe(CandidateSummaryStatus.Failed);
    expect(updated.errorMessage).toBe('provider failure');
  });
});
