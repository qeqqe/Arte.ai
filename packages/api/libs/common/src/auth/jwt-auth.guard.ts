import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    this.logger.log(`JwtAuthGuard: Processing request`);
    this.logger.debug(`Request path: ${request.path}`);
    this.logger.debug(
      `Has authorization header: ${!!request.headers.authorization}`,
    );
    this.logger.debug(
      `Has cookies: ${!!request.cookies && Object.keys(request.cookies).length > 0}`,
    );

    if (request.headers.authorization) {
      this.logger.debug(
        `Auth header: ${request.headers.authorization.substring(0, 15)}...`,
      );
    }

    if (request.cookies?.access_token) {
      this.logger.debug(
        `Cookie token found (first 15 chars): ${request.cookies.access_token.substring(0, 15)}...`,
      );
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    if (err) {
      this.logger.error(`JWT authentication error: ${err.message}`, err.stack);
      throw err;
    }

    if (!user) {
      this.logger.warn(`JWT authentication failed`);

      if (info) {
        this.logger.warn(
          `JWT failure info: ${info.message || JSON.stringify(info)}`,
        );

        if (info instanceof Error) {
          this.logger.debug(
            `Error details: ${info.name}, Stack: ${info.stack}`,
          );
        }
      }

      const hasAuthHeader = !!request.headers.authorization;
      const hasCookie = !!request.cookies?.access_token;

      if (!hasAuthHeader && !hasCookie) {
        this.logger.debug('No authentication tokens found in request');
        throw new UnauthorizedException('Authentication token not provided');
      } else {
        this.logger.debug('Token found but validation failed');
        throw new UnauthorizedException(
          'Invalid or expired authentication token',
        );
      }
    }

    this.logger.log(`JWT authentication successful for user: ${user.id}`);
    return user;
  }
}
