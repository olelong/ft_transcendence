import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import AuthGuard, { IsSocket } from '../../auth.guard';
import { WsExceptionsFilter } from '../utils';

@UseFilters(WsExceptionsFilter)
@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: true,
    methods: 'GET',
    credentials: true,
  },
})
export default class GameGateway implements OnGatewayInit, OnGatewayConnection {
  private logger: Logger = new Logger('GameGateway');

  afterInit(server: Server): void {
    void server;
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket): void {
    console.log('Client connected', client.id);
  }

  @IsSocket()
  @UseGuards(AuthGuard)
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): string {
    console.log(client.id);
    return payload + ' game';
  }
}
