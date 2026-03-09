import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Candidate } from './candidates/entities/candidate.entity';
import { CandidateDocument } from './candidates/documents/entities/candidate-document.entity';
import { CandidateSummary } from './candidates/summaries/entities/candidate-summary.entity';
import { CreateCandidateDocumentsTable1710000000000 } from './migrations/1710000000000-CreateCandidateDocumentsTable';
import { CreateCandidateSummariesTable1710000001000 } from './migrations/1710000001000-CreateCandidateSummariesTable';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ts_version',
  entities: [Candidate, CandidateDocument, CandidateSummary],
  migrations: [CreateCandidateDocumentsTable1710000000000, CreateCandidateSummariesTable1710000001000]
});
