import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GithubUserDto } from '@app/dtos/github';
import { Logger } from 'nestjs-pino';

interface AuthenticatedRequest extends Request {
  user: GithubUserDto;
}

@Controller('auth/github')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(AuthGuard('github'))
  githubAuth() {}

  @Get('callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const user = await this.authService.findOrCreateUser(req.user);
      const tokens = await this.authService.generateTokens(user);

      await this.authService.storeRefreshToken(
        user.user.id,
        tokens.refreshToken,
      );

      const isProduction =
        this.configService.get<string>('NODE_ENV') === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
      };

      res.cookie('access_token', tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15m
      });

      res.cookie('refresh_token', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      res.redirect(
        `${frontendUrl}/${
          user.user.hasCompletedOnboarding === true ? 'dashboard' : 'onboarding'
        }`,
      );
      this.logger.log(
        `User ${req.user.username} was redirected to ${frontendUrl}/${
          user.user.hasCompletedOnboarding === true ? 'dashboard' : 'onboarding'
        }`,
      );
    } catch (error) {
      this.logger.error('Authentication failed', error);
      throw new InternalServerErrorException('Authentication failed');
    }
  }
}
