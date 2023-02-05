import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
  CustomDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';

@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // If route is marked as public then no authentication is required
    if (this.reflector.get<boolean>('isPublic', context.getHandler()))
      return true;

    interface CookieHeader {
      headers: { cookie: string };
    }
    let req: CookieHeader & { userId: string };
    let client: { handshake: CookieHeader } & { userId: string };
    let cookie: string;
    const isSocket = this.reflector.get<boolean>(
      'isSocket',
      context.getHandler(),
    );
    if (!isSocket) {
      req = context.switchToHttp().getRequest();
      cookie = req.headers.cookie;
    } else {
      client = context.switchToWs().getClient();
      cookie = client.handshake.headers.cookie;
    }
    try {
      if (!cookie) throw "No token provided in 'cookie' header";
      const token = parseCookie(cookie).token;
      if (!token) throw 'Token format must be token={token}';
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = (decoded as { userId: string }).userId;
      if (req) req.userId = userId;
      else client.userId = userId;
      return true;
    } catch (e) {
      let message: string;
      if (e instanceof Error) message = 'Invalid token';
      if (!isSocket) throw new UnauthorizedException(message || e);
      else {
        console.log(message || (e as string));
        throw new WsException(message || (e as string));
      }
    }
  }
}

// Public decorator is used to revoke auth guard
export const Public = (): CustomDecorator<string> =>
  SetMetadata('isPublic', true);

// IsSocket decorator is used to tell to the AuthGuard
// that the context is a socket connection
export const IsSocket = (): CustomDecorator<string> =>
  SetMetadata('isSocket', true);

function parseCookie(cookie: string): { token?: string } {
  return cookie
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
}
