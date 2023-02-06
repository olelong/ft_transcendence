import { Injectable } from '@nestjs/common';
import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common/interfaces';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsException } from '@nestjs/websockets';
import { Observable, catchError, EMPTY } from 'rxjs';
import { Server, ServerOptions, Socket } from 'socket.io';

import { NetError } from './protocols';
import { verifyJwt } from '../auth.guard';

@Injectable()
export class GatewayInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<never> {
    console.log('before');
    return next.handle().pipe(
      catchError((err: WsException) => {
        this.catch(err, context);
        return EMPTY;
      }),
    ) as Observable<never>;
  }

  catch(exception: WsException, context: ExecutionContext): void {
    const ws = context.switchToWs();
    const client: Socket = ws.getClient();
    const data = ws.getData<object>();
    const event = Reflect.getMetadata(
      'message',
      context.getHandler(),
    ) as string;
    let errorMsg = exception.getError();
    if (typeof errorMsg === 'object') errorMsg = JSON.stringify(errorMsg);
    const error: NetError = {
      errorMsg,
      origin: { event, data },
    };
    client.emit('error', error);
  }
}

export class SocketIOAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): Server {
    const optionsWithCORS: ServerOptions = {
      ...options,
      cors: {
        origin: true,
        methods: 'GET',
        credentials: true,
      },
    };
    const server: Server = super.createIOServer(
      port,
      optionsWithCORS,
    ) as Server;

    server.of('game').use(tokenMiddleware);

    return server;
  }
}

function tokenMiddleware(
  socket: Socket & { userId?: string },
  next: (err?: Error) => void,
): void {
  try {
    socket.userId = verifyJwt(socket.handshake.headers.cookie);
    next();
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = 'Invalid token';
    next(new Error(message || (e as string)));
  }
}
