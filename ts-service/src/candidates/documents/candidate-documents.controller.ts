import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { WorkspaceId } from '../../auth/workspace.decorator';
import { CandidateDocumentsService } from './candidate-documents.service';
import { CreateCandidateDocumentDto } from './dto/create-candidate-document.dto';

@UseGuards(AuthGuard)
@Controller('candidates/:candidateId/documents')
export class CandidateDocumentsController {
  constructor(private readonly documentsService: CandidateDocumentsService) {}

  @Post()
  create(
    @Param('candidateId') candidateId: string,
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateCandidateDocumentDto
  ) {
    return this.documentsService.create(candidateId, dto, workspaceId);
  }
}
