import { Test, TestingModule } from '@nestjs/testing';
import { CandidateDocumentsController } from './candidate-documents.controller';
import { CandidateDocumentsService } from './candidate-documents.service';
import { AuthGuard } from '../../auth/auth.guard';

describe('CandidateDocumentsController', () => {
  let controller: CandidateDocumentsController;
  let service: CandidateDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateDocumentsController],
      providers: [
        {
          provide: CandidateDocumentsService,
          useValue: {
            create: jest.fn()
          }
        }
      ]
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const request = context.switchToHttp().getRequest();
          request.user = { workspaceId: 'workspace-1' };
          return true;
        }
      })
      .compile();

    controller = module.get<CandidateDocumentsController>(CandidateDocumentsController);
    service = module.get<CandidateDocumentsService>(CandidateDocumentsService);
  });

  it('should create a document with valid body and workspace', async () => {
    const dto = {
      documentType: 'resume',
      fileName: 'file.pdf',
      storageKey: 'storage/file.pdf',
      rawText: 'content'
    } as any;

    (service.create as jest.Mock).mockResolvedValue({ id: 'doc-1', ...dto });

    const result = await controller.create('candidate-1', 'workspace-1', dto);

    expect(service.create).toHaveBeenCalledWith('candidate-1', dto, 'workspace-1');
    expect(result.id).toBe('doc-1');
  });

  it('should reject missing required fields via validation', async () => {
    const invalidDto = {
      documentType: 'resume'
    } as any;

    await expect(controller.create('candidate-1', 'workspace-1', invalidDto)).rejects.toBeDefined();
  });
});
