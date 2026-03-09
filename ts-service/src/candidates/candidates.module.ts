import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { CandidateDocumentsModule } from './documents/candidate-documents.module';
import { CandidateSummariesModule } from './summaries/candidate-summaries.module';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate]), CandidateDocumentsModule, CandidateSummariesModule],
  exports: [TypeOrmModule]
})
export class CandidatesModule {}
