import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { CandidateSummary, CandidateSummaryStatus } from './entities/candidate-summary.entity';
import { CandidateDocument } from '../documents/entities/candidate-document.entity';
import { SUMMARIZATION_PROVIDER } from '../../providers/summarization/summarization-provider.token';
import { SummarizationProvider } from '../../providers/summarization/summarization-provider.interface';
import { PROMPT_VERSION } from '../../providers/summarization/gemini-summarization.provider';

@Processor('candidate-summaries')
export class CandidateSummariesWorker {
  constructor(
    @InjectRepository(CandidateSummary) private readonly summaryRepository: Repository<CandidateSummary>,
    @InjectRepository(CandidateDocument) private readonly documentRepository: Repository<CandidateDocument>,
    @Inject(SUMMARIZATION_PROVIDER) private readonly summarizationProvider: SummarizationProvider
  ) {}

  @Process('generate-candidate-summary')
  async handleGenerateCandidateSummary(
    job: Job<{ summaryId: string; candidateId: string }>
  ): Promise<void> {
    const { summaryId, candidateId } = job.data;

    const summary = await this.summaryRepository.findOne({ where: { id: summaryId, candidateId } });
    if (!summary) {
      throw new Error('Summary not found');
    }

    const documents = await this.documentRepository.find({ where: { candidateId } });

    if (!documents.length) {
      summary.status = CandidateSummaryStatus.Failed;
      summary.errorMessage = 'No documents found for candidate';
      await this.summaryRepository.save(summary);
      return;
    }

    try {
      const result = await this.summarizationProvider.generateCandidateSummary({
        candidateId,
        documents: documents.map(document => ({
          documentType: document.documentType,
          rawText: document.rawText
        }))
      });

      summary.status = CandidateSummaryStatus.Completed;
      summary.score = result.score;
      summary.strengths = result.strengths;
      summary.concerns = result.concerns;
      summary.summary = result.summary;
      summary.recommendedDecision = result.recommendedDecision;
      summary.provider = 'gemini';
      summary.promptVersion = PROMPT_VERSION;
      summary.errorMessage = null;

      await this.summaryRepository.save(summary);
    } catch (error) {
      summary.status = CandidateSummaryStatus.Failed;
      summary.errorMessage = error instanceof Error ? error.message : 'Unknown provider error';
      await this.summaryRepository.save(summary);
    }
  }
}
