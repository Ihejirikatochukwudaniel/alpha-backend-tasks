import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CandidateDocument } from './entities/candidate-document.entity';
import { CreateCandidateDocumentDto } from './dto/create-candidate-document.dto';

@Injectable()
export class CandidateDocumentsService {
  constructor(
    @InjectRepository(Candidate) private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(CandidateDocument) private readonly documentRepository: Repository<CandidateDocument>
  ) {}

  async create(candidateId: string, dto: CreateCandidateDocumentDto, workspaceId: string): Promise<CandidateDocument> {
    const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } });
    if (!candidate) {
      throw new NotFoundException();
    }
    if (candidate.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    const document = this.documentRepository.create({
      candidateId,
      documentType: dto.documentType,
      fileName: dto.fileName,
      storageKey: dto.storageKey,
      rawText: dto.rawText
    });

    return this.documentRepository.save(document);
  }

  async findAllForCandidate(candidateId: string, workspaceId: string): Promise<CandidateDocument[]> {
    const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } });
    if (!candidate) {
      throw new NotFoundException();
    }
    if (candidate.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    return this.documentRepository.find({ where: { candidateId } });
  }
}
