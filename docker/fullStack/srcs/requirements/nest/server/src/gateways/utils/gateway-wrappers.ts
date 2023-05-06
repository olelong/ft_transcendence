import {
  HttpException,
  Injectable,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
import { verifyJwt } from '../../auth.guard';

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
    server.of('chat').use(tokenMiddleware);

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
    console.error(e);
    let message: string;
    if (e instanceof Error) message = 'Invalid token';
    next(new Error(message || (e as string)));
  }
}

@Injectable()
class GatewayInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<never> {
    return next.handle().pipe(
      catchError((err: WsException) => {
        this.catch(err, context);
        return EMPTY;
      }),
    ) as Observable<never>;
  }

  catch(
    exception: WsException | HttpException,
    context: ExecutionContext,
  ): void {
    let errorMsg: string | string[];
    if (
      !(exception instanceof HttpException) &&
      !(exception instanceof WsException)
    )
      return console.error(exception);
    // The exception should be an HttpException ONLY
    // if the body didn't pass the DTO validation
    if (exception instanceof HttpException)
      errorMsg = (exception.getResponse() as { message: string[] }).message;
    else errorMsg = exception.getError() as string;
    const ws = context.switchToWs();
    const client: Socket = ws.getClient();
    const data = ws.getData<object>();
    const event = Reflect.getMetadata(
      'message',
      context.getHandler(),
    ) as string;
    const error: NetError = {
      errorMsg,
      origin: { event, data },
    };
    client.emit('error', error);
  }
}

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseInterceptors(GatewayInterceptor)
export abstract class BaseGateway {}
