import { CandidateSummaryStatus } from '../entities/candidate-summary.entity';

export class SummaryResponseDto {
  id: string;
  candidateId: string;
  status: CandidateSummaryStatus;
  score: number | null;
  strengths: string[] | null;
  concerns: string[] | null;
  summary: string | null;
  recommendedDecision: string | null;
  provider: string | null;
  promptVersion: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
