import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Candidate } from '../entities/candidate.entity';
import { CandidateDocument } from '../documents/entities/candidate-document.entity';
import { CandidateSummary } from './entities/candidate-summary.entity';
import { CandidateSummariesService } from './candidate-summaries.service';
import { CandidateSummariesController } from './candidate-summaries.controller';
import { CandidateSummariesWorker } from './candidate-summaries.worker';
import { SUMMARIZATION_PROVIDER } from '../../providers/summarization/summarization-provider.token';
import { GeminiSummarizationProvider } from '../../providers/summarization/gemini-summarization.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate, CandidateDocument, CandidateSummary]),
    BullModule.registerQueue({
      name: 'candidate-summaries'
    })
  ],
  providers: [
    CandidateSummariesService,
    CandidateSummariesWorker,
    {
      provide: SUMMARIZATION_PROVIDER,
      useClass: GeminiSummarizationProvider
    }
  ],
  controllers: [CandidateSummariesController],
  exports: [CandidateSummariesService]
})
export class CandidateSummariesModule {}
