import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CandidateDocumentType } from '../entities/candidate-document.entity';

export class CreateCandidateDocumentDto {
  @IsEnum(CandidateDocumentType)
  documentType: CandidateDocumentType;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  storageKey: string;

  @IsString()
  @IsNotEmpty()
  rawText: string;
}
