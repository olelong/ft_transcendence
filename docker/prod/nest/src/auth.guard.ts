import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
  CustomDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // If route is marked as public then no authentication is required
    if (this.reflector.get<boolean>('isPublic', context.getHandler()))
      return true;

    const req: { headers: { cookie: string }; userId: string } = context
      .switchToHttp()
      .getRequest();
    try {
      if (!req.headers.cookie) throw "No token provided in 'cookie' header";
      const token = parseCookie(req.headers.cookie).token;
      if (!token) throw 'Token format must be token={token}';
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.userId = (decoded as { userId: string }).userId;
      return true;
    } catch (e) {
      let message: string;
      if (e instanceof Error) message = 'Invalid token';
      throw new UnauthorizedException(message || e);
    }
  }
}

// Public decorator is used to revoke auth guard
export const Public = (): CustomDecorator<string> =>
  SetMetadata('isPublic', true);

function parseCookie(cookie: string): { token?: string } {
  return cookie
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
}
