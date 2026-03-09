import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InvalidProviderResponseError } from './invalid-provider-response.error';
import { SummarizationInput, SummarizationProvider, SummaryResult } from './summarization-provider.interface';

export const PROMPT_VERSION = 'v1';

@Injectable()
export class GeminiSummarizationProvider implements SummarizationProvider {
  async generateCandidateSummary(input: SummarizationInput): Promise<SummaryResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InvalidProviderResponseError('GEMINI_API_KEY is not configured');
    }

    const prompt = this.buildPrompt(input);

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2
        }
      },
      {
        params: {
          key: apiKey
        }
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      response.data?.candidates?.[0]?.outputText ??
      response.data?.outputText;

    if (typeof text !== 'string') {
      throw new InvalidProviderResponseError('Provider response missing text content');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new InvalidProviderResponseError('Provider returned malformed JSON');
    }

    if (!this.isValidSummaryResult(parsed)) {
      throw new InvalidProviderResponseError('Provider returned invalid summary structure');
    }

    return parsed;
  }

  private buildPrompt(input: SummarizationInput): string {
    const documentsText = input.documents
      .map(
        d =>
          `Document type: ${d.documentType}
Content:
${d.rawText}`
      )
      .join('\n\n');

    const instructions =
      'You are an AI assistant evaluating a job candidate based on their documents. ' +
      'Return only a valid JSON object with no markdown, no explanations, and no code fences. ' +
      'The JSON shape must be exactly: ' +
      '{ "score": number between 0 and 100, "strengths": string array, "concerns": string array, "summary": string, "recommendedDecision": string }.';

    return `${instructions}

Candidate ID: ${input.candidateId}

Candidate documents:
${documentsText}`;
  }

  private isValidSummaryResult(value: unknown): value is SummaryResult {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const result = value as Record<string, unknown>;

    if (typeof result.score !== 'number') {
      return false;
    }

    if (!Array.isArray(result.strengths) || !result.strengths.every(item => typeof item === 'string')) {
      return false;
    }

    if (!Array.isArray(result.concerns) || !result.concerns.every(item => typeof item === 'string')) {
      return false;
    }

    if (typeof result.summary !== 'string') {
      return false;
    }

    if (typeof result.recommendedDecision !== 'string') {
      return false;
    }

    return true;
  }
}
