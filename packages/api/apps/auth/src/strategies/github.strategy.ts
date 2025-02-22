import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { Logger } from 'nestjs-pino';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
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
    _refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    try {
      const githubUser = {
        id: profile.id,
        username: profile.username,
        email: profile.emails?.[0]?.value || null,
        avatarUrl: profile._json.avatar_url,
        accessToken,
      };
      return done(null, githubUser);
    } catch (err) {
      this.logger.error('GitHub validation failed', err);
      return done(err, false);
    }
  }
}
