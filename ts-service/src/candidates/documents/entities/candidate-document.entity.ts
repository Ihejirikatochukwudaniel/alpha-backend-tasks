import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Candidate } from '../../entities/candidate.entity';

export enum CandidateDocumentType {
  Resume = 'resume',
  CoverLetter = 'cover_letter',
  Other = 'other'
}

@Entity('candidate_documents')
export class CandidateDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  candidateId: string;

  @ManyToOne(() => Candidate)
  candidate: Candidate;

  @Column({ type: 'enum', enum: CandidateDocumentType })
  documentType: CandidateDocumentType;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 255 })
  storageKey: string;

  @Column({ type: 'text' })
  rawText: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  uploadedAt: Date;
}
