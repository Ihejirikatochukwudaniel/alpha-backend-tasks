import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Candidate } from '../../entities/candidate.entity';

export enum CandidateSummaryStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed'
}

@Entity('candidate_summaries')
export class CandidateSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  candidateId: string;

  @ManyToOne(() => Candidate)
  candidate: Candidate;

  @Column({ type: 'enum', enum: CandidateSummaryStatus, default: CandidateSummaryStatus.Pending })
  status: CandidateSummaryStatus;

  @Column({ type: 'double precision', nullable: true })
  score: number | null;

  @Column({ type: 'text', array: true, nullable: true })
  strengths: string[] | null;

  @Column({ type: 'text', array: true, nullable: true })
  concerns: string[] | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recommendedDecision: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  provider: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  promptVersion: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
