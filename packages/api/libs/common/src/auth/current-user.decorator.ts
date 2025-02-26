import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
}

// Extend express req to include user property
declare module 'express' {
  interface Request {
    user?: UserPayload;
  }
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      return undefined;
    }

    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
