import { Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { WorkspaceId } from '../../auth/workspace.decorator';
import { CandidateSummariesService } from './candidate-summaries.service';
import { SummaryResponseDto } from './dto/summary-response.dto';

@UseGuards(AuthGuard)
@Controller('candidates/:candidateId/summaries')
export class CandidateSummariesController {
  constructor(private readonly summariesService: CandidateSummariesService) {}

  @Post('generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestGeneration(@Param('candidateId') candidateId: string, @WorkspaceId() workspaceId: string) {
    const summary = await this.summariesService.requestGeneration(candidateId, workspaceId);
    return { summaryId: summary.id, status: summary.status };
  }

  @Get()
  async findAll(@Param('candidateId') candidateId: string, @WorkspaceId() workspaceId: string): Promise<SummaryResponseDto[]> {
    const summaries = await this.summariesService.findAllForCandidate(candidateId, workspaceId);
    return summaries.map(summary => ({
      id: summary.id,
      candidateId: summary.candidateId,
      status: summary.status,
      score: summary.score,
      strengths: summary.strengths,
      concerns: summary.concerns,
      summary: summary.summary,
      recommendedDecision: summary.recommendedDecision,
      provider: summary.provider,
      promptVersion: summary.promptVersion,
      errorMessage: summary.errorMessage,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt
    }));
  }

  @Get(':summaryId')
  async findOne(
    @Param('candidateId') candidateId: string,
    @Param('summaryId') summaryId: string,
    @WorkspaceId() workspaceId: string
  ): Promise<SummaryResponseDto> {
    const summary = await this.summariesService.findOne(candidateId, summaryId, workspaceId);
    return {
      id: summary.id,
      candidateId: summary.candidateId,
      status: summary.status,
      score: summary.score,
      strengths: summary.strengths,
      concerns: summary.concerns,
      summary: summary.summary,
      recommendedDecision: summary.recommendedDecision,
      provider: summary.provider,
      promptVersion: summary.promptVersion,
      errorMessage: summary.errorMessage,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt
    };
  }
}
