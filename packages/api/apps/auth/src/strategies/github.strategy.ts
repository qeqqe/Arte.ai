import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
export class GithubStartegy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email', 'read:user', 'public_repo'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    try {
      const { id, username, emails } = profile;

      const user = {
        githubId: id,
        username,
        email: emails?.[0]?.value || null,
        accessToken,
        refreshToken,
      };
      return done(null, user);
    } catch (err) {
      this.logger.error('GitHub authentication error:', err);
      return done(err, false);
    }
  }
}
