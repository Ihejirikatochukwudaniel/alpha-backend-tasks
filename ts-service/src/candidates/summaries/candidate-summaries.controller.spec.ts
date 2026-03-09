import { Test, TestingModule } from '@nestjs/testing';
import { CandidateSummariesController } from './candidate-summaries.controller';
import { CandidateSummariesService } from './candidate-summaries.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CandidateSummaryStatus } from './entities/candidate-summary.entity';

describe('CandidateSummariesController', () => {
  let controller: CandidateSummariesController;
  let service: CandidateSummariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateSummariesController],
      providers: [
        {
          provide: CandidateSummariesService,
          useValue: {
            requestGeneration: jest.fn(),
            findAllForCandidate: jest.fn(),
            findOne: jest.fn()
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

    controller = module.get<CandidateSummariesController>(CandidateSummariesController);
    service = module.get<CandidateSummariesService>(CandidateSummariesService);
  });

  it('should create pending summary and return 202 response shape', async () => {
    (service.requestGeneration as jest.Mock).mockResolvedValue({
      id: 'summary-1',
      status: CandidateSummaryStatus.Pending
    });

    const result = await controller.requestGeneration('candidate-1', 'workspace-1');

    expect(service.requestGeneration).toHaveBeenCalledWith('candidate-1', 'workspace-1');
    expect(result).toEqual({ summaryId: 'summary-1', status: CandidateSummaryStatus.Pending });
  });

  it('should return summaries array', async () => {
    const summaries = [
      {
        id: 'summary-1',
        candidateId: 'candidate-1',
        status: CandidateSummaryStatus.Completed,
        score: 90,
        strengths: ['a'],
        concerns: ['b'],
        summary: 'summary',
        recommendedDecision: 'hire',
        provider: 'gemini',
        promptVersion: 'v1',
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    (service.findAllForCandidate as jest.Mock).mockResolvedValue(summaries);

    const result = await controller.findAll('candidate-1', 'workspace-1');

    expect(service.findAllForCandidate).toHaveBeenCalledWith('candidate-1', 'workspace-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('summary-1');
  });

  it('should return single summary', async () => {
    const summary = {
      id: 'summary-1',
      candidateId: 'candidate-1',
      status: CandidateSummaryStatus.Completed,
      score: 90,
      strengths: ['a'],
      concerns: ['b'],
      summary: 'summary',
      recommendedDecision: 'hire',
      provider: 'gemini',
      promptVersion: 'v1',
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (service.findOne as jest.Mock).mockResolvedValue(summary);

    const result = await controller.findOne('candidate-1', 'summary-1', 'workspace-1');

    expect(service.findOne).toHaveBeenCalledWith('candidate-1', 'summary-1', 'workspace-1');
    expect(result.id).toBe('summary-1');
  });
}
