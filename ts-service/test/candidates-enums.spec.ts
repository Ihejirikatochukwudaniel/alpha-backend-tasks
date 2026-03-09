import { CandidateDocumentType } from '../src/candidates/documents/entities/candidate-document.entity';
import { CandidateSummaryStatus } from '../src/candidates/summaries/entities/candidate-summary.entity';

describe('Candidates Enums', () => {
  it('CandidateDocumentType contains expected values', () => {
    expect(CandidateDocumentType.Resume).toBe('resume');
    expect(CandidateDocumentType.CoverLetter).toBe('cover_letter');
    expect(CandidateDocumentType.Other).toBe('other');
  });

  it('CandidateSummaryStatus contains expected values', () => {
    expect(CandidateSummaryStatus.Pending).toBe('pending');
    expect(CandidateSummaryStatus.Completed).toBe('completed');
    expect(CandidateSummaryStatus.Failed).toBe('failed');
  });
});
