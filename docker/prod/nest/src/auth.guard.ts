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
      req.userId = verifyJwt(req.headers.cookie);
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

export function verifyJwt(cookieHeader: string): string {
  if (!cookieHeader) throw "No token provided in 'cookie' header";
  const token = parseCookie(cookieHeader).token;
  if (!token) throw 'Token format must be token={token}';
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  return (decoded as { userId: string }).userId;
}

function parseCookie(cookie: string): { token?: string } {
  return cookie
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
}
