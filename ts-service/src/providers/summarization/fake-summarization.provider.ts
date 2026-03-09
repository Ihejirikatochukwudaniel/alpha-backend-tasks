import { Injectable } from '@nestjs/common';
import { SummarizationInput, SummarizationProvider, SummaryResult } from './summarization-provider.interface';

@Injectable()
export class FakeSummarizationProvider implements SummarizationProvider {
  async generateCandidateSummary(input: SummarizationInput): Promise<SummaryResult> {
    return {
      score: 85,
      strengths: ['Strong communication skills', 'Relevant experience'],
      concerns: ['Limited leadership experience'],
      summary: `Candidate ${input.candidateId} appears to be a strong fit based on the provided documents.`,
      recommendedDecision: 'advance_to_next_round'
    };
  }
}
