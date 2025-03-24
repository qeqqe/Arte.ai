import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from './github.service';
import { HttpService } from '@nestjs/axios';
import { Logger } from 'nestjs-pino';
import { DRIZZLE_PROVIDER } from '@app/common/drizzle';
import { userGithubSchema } from '@app/common/github';

describe('GithubService', () => {
  let service: GithubService;

  const mockHttpService = {
    axiosRef: {
      post: jest.fn(),
      get: jest.fn(),
    },
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockDrizzle = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDrizzle,
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRepoData', () => {
    const userId = 'test-user-id';
    const mockUserGithub = [
      {
        userId: 'test-user-id',
        username: 'testuser',
        accessToken: 'test-token',
      },
    ];

    const mockPinnedRepos = {
      data: {
        data: {
          user: {
            pinnedItems: {
              nodes: [
                {
                  name: 'test-repo',
                  url: 'https://github.com/testuser/test-repo',
                  description: 'Test repo description',
                  stargazerCount: 10,
                  forkCount: 5,
                  primaryLanguage: { name: 'TypeScript' },
                  repositoryTopics: {
                    nodes: [
                      { topic: { name: 'api' } },
                      { topic: { name: 'typescript' } },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    };

    const mockLanguages = { TypeScript: 10000, JavaScript: 5000 };
    const mockReadme = '# Test Repo\nThis is a test repository.';

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();

      // Mock database response for user info
      mockDrizzle.where.mockResolvedValue(mockUserGithub);

      // Mock GitHub API responses
      mockHttpService.axiosRef.post.mockResolvedValue(mockPinnedRepos);
      mockHttpService.axiosRef.get.mockImplementation((url) => {
        if (url.includes('languages')) {
          return Promise.resolve({ data: mockLanguages });
        }
        if (url.includes('readme')) {
          return Promise.resolve({
            data: {
              content: Buffer.from(mockReadme).toString('base64'),
              encoding: 'base64',
            },
          });
        }
        return Promise.resolve({ data: {} });
      });

      // Mock database insert
      mockDrizzle.returning.mockResolvedValue([
        {
          id: 1,
          name: 'test-repo',
          url: 'https://github.com/testuser/test-repo',
          userId: 'test-user-id',
        },
      ]);
    });

    it('should fetch user GitHub information and repositories', async () => {
      await service.getUserRepoData(userId);

      // Check if database was queried for user info
      expect(mockDrizzle.select).toHaveBeenCalled();
      expect(mockDrizzle.from).toHaveBeenCalledWith(userGithubSchema);

      // Check if GitHub API was called with correct parameters
      expect(mockHttpService.axiosRef.post).toHaveBeenCalledWith(
        'https://api.github.com/graphql',
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'bearer test-token',
          }),
        }),
      );
    });

    it('should process and store repository data', async () => {
      await service.getUserRepoData(userId);

      // Check if repositories were inserted into database
      expect(mockDrizzle.insert).toHaveBeenCalled();
      expect(mockDrizzle.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-repo',
          userId: 'test-user-id',
        }),
      );
    });

    it('should handle errors when user GitHub info is not found', async () => {
      mockDrizzle.where.mockResolvedValueOnce([]);

      await expect(service.getUserRepoData(userId)).rejects.toThrow(
        `GitHub information not found for user ${userId}`,
      );
    });
  });
});
