import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;

        // try from cookies first
        if (req.cookies && req.cookies.access_token) {
          token = req.cookies.access_token;
          this.logger.debug('Found JWT token in cookies');
        }

        // if not in cookies, try authorization header
        if (!token && req.headers.authorization) {
          // check if it starts with Bearer
          if (req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
            this.logger.debug('Found JWT token in Authorization header');
          } else {
            // if auth header doesn't use Bearer scheme, use the raw value
            token = req.headers.authorization;
            this.logger.debug('Using raw Authorization header value');
          }
        }

        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true, // pass request to validate for additional context
    });

    this.logger.log('JWT Strategy initialized with config');
  }

  async validate(req: Request, payload: JwtPayload) {
    if (!payload) {
      this.logger.error('JWT payload is empty or invalid');
      throw new UnauthorizedException('Invalid token payload');
    }

    this.logger.debug(
      `JWT validated for user: ${payload.sub} (${payload.email})`,
    );

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
