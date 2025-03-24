import { Test, TestingModule } from '@nestjs/testing';
import { GithubController } from './github.controller';
import { GithubService } from '../../services/github/github.service';
import { JwtAuthGuard } from '@app/common';
import { Request } from 'express';

describe('GithubController', () => {
  let controller: GithubController;
  let githubService: GithubService;

  const mockGithubService = {
    getUserRepoData: jest.fn().mockResolvedValue([
      {
        name: 'test-repo',
        url: 'https://github.com/user/test-repo',
        description: 'Test repository',
        stargazerCount: 10,
        forkCount: 5,
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GithubController],
      providers: [
        {
          provide: GithubService,
          useValue: mockGithubService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<GithubController>(GithubController);
    githubService = module.get<GithubService>(GithubService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserTopRepo', () => {
    it('should call githubService.getUserRepoData with the correct user ID', async () => {
      const mockRequest = {
        user: { id: 'test-user-id', email: 'test@example.com' },
      } as Request;

      await controller.getUserTopRepo(mockRequest);

      expect(githubService.getUserRepoData).toHaveBeenCalledWith(
        'test-user-id',
      );
    });

    it('should return repository data from the github service', async () => {
      const mockRequest = {
        user: { id: 'test-user-id', email: 'test@example.com' },
      } as Request;

      const result = await controller.getUserTopRepo(mockRequest);

      expect(result).toEqual([
        expect.objectContaining({
          name: 'test-repo',
          url: 'https://github.com/user/test-repo',
        }),
      ]);
    });
  });
});
