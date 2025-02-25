import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Logger } from 'nestjs-pino';
import { Response } from 'express';
import { GithubUserDto } from '@app/dtos/github';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;

  // Mock data
  const mockGithubUser: GithubUserDto = {
    id: '123',
    username: 'testuser',
    email: 'test@github.com',
    avatarUrl: 'https://github.com/avatar.jpg',
    accessToken: 'github_access_token',
  };

  const mockUser = {
    user: {
      id: 'uuid-1234',
      avatarUrl: 'https://github.com/avatar.jpg',
      refreshToken: null,
    },
    github: {
      id: 'github-123',
      email: 'test@github.com',
      username: 'testuser',
    },
  };

  const mockTokens = {
    accessToken: 'jwt_access_token',
    refreshToken: 'jwt_refresh_token',
  };

  // mock response object
  const mockResponse = {
    cookie: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            findOrCreateUser: jest.fn().mockResolvedValue(mockUser),
            generateTokens: jest.fn().mockResolvedValue(mockTokens),
            storeRefreshToken: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                NODE_ENV: 'development',
                FRONTEND_URL: 'http://localhost:5173',
              };
              return config[key];
            }),
            getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('githubCallback', () => {
    it('should handle successful authentication', async () => {
      const req = { user: mockGithubUser };

      await controller.githubCallback(req as any, mockResponse);

      // Verify user was created/found
      expect(authService.findOrCreateUser).toHaveBeenCalledWith(mockGithubUser);

      // Verify tokens were generated
      expect(authService.generateTokens).toHaveBeenCalledWith(mockUser);

      // Verify refresh token was stored
      expect(authService.storeRefreshToken).toHaveBeenCalledWith(
        mockUser.user.id,
        mockTokens.refreshToken,
      );

      // Verify cookies were set
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockTokens.accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000,
        }),
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockTokens.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }),
      );

      // Verify redirect
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth-success',
      );
    });

    it('should handle authentication failure', async () => {
      const req = { user: mockGithubUser };
      const error = new Error('Authentication failed');

      jest.spyOn(authService, 'findOrCreateUser').mockRejectedValueOnce(error);

      await expect(
        controller.githubCallback(req as any, mockResponse),
      ).rejects.toThrow('Authentication failed');
    });
  });
});
