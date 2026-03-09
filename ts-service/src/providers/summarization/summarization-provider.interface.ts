export interface SummarizationInput {
  candidateId: string;
  documents: Array<{ documentType: string; rawText: string }>;
}

export interface SummaryResult {
  score: number;
  strengths: string[];
  concerns: string[];
  summary: string;
  recommendedDecision: string;
}

export interface SummarizationProvider {
  generateCandidateSummary(input: SummarizationInput): Promise<SummaryResult>;
}
