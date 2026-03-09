import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CandidateDocument } from './entities/candidate-document.entity';
import { CandidateDocumentsService } from './candidate-documents.service';
import { CandidateDocumentsController } from './candidate-documents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, CandidateDocument])],
  providers: [CandidateDocumentsService],
  controllers: [CandidateDocumentsController],
  exports: [CandidateDocumentsService]
})
export class CandidateDocumentsModule {}
