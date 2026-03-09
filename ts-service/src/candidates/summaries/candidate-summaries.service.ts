import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CandidateSummary, CandidateSummaryStatus } from './entities/candidate-summary.entity';

@Injectable()
export class CandidateSummariesService {
  constructor(
    @InjectRepository(Candidate) private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(CandidateSummary) private readonly summaryRepository: Repository<CandidateSummary>,
    @InjectQueue('candidate-summaries') private readonly queue: Queue
  ) {}

  async requestGeneration(candidateId: string, workspaceId: string): Promise<CandidateSummary> {
    const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } });
    if (!candidate) {
      throw new NotFoundException();
    }
    if (candidate.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    const summary = this.summaryRepository.create({
      candidateId,
      status: CandidateSummaryStatus.Pending
    });

    const saved = await this.summaryRepository.save(summary);

    await this.queue.add('generate-candidate-summary', {
      summaryId: saved.id,
      candidateId
    });

    return saved;
  }

  async findAllForCandidate(candidateId: string, workspaceId: string): Promise<CandidateSummary[]> {
    const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } });
    if (!candidate) {
      throw new NotFoundException();
    }
    if (candidate.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    return this.summaryRepository.find({
      where: { candidateId },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(candidateId: string, summaryId: string, workspaceId: string): Promise<CandidateSummary> {
    const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } });
    if (!candidate) {
      throw new NotFoundException();
    }
    if (candidate.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    const summary = await this.summaryRepository.findOne({ where: { id: summaryId, candidateId } });
    if (!summary) {
      throw new NotFoundException();
    }
    return summary;
  }
}
