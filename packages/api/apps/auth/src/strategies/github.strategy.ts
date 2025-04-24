import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { GithubUserDto } from '@app/dtos/github';
import { Logger } from 'nestjs-pino';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    super({
      clientID: configService.getOrThrow('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GITHUB_CALLBACK_URL'),
      scope: ['user:email', 'read:user', 'public_repo'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<GithubUserDto> {
    this.logger.log(
      `GitHub OAuth validation for user ${
        profile.username || profile.displayName
      }`,
    );

    // Log token for debugging (truncated for security)
    this.logger.debug(
      `Received GitHub access token (first 10 chars): ${accessToken.substring(
        0,
        10,
      )}...`,
    );

    // Find primary email
    const primaryEmail = profile.emails?.find(
      (email: any) => email.primary,
    )?.value;

    const email = primaryEmail || profile.emails?.[0]?.value;

    if (!email) {
      this.logger.error('No email found in GitHub profile');
      throw new Error('No email found in GitHub profile');
    }

    const user: GithubUserDto = {
      id: profile.id,
      username: profile.username || profile.displayName,
      email: email,
      avatarUrl: profile.photos?.[0]?.value || '',
      accessToken: accessToken, // Make sure we're storing the access token
    };

    // Log user data that will be stored (without sensitive data)
    this.logger.debug(`Created GithubUserDto for ${user.username}`);

    return user;
  }
}
