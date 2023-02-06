import { UseInterceptors } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { GatewayInterceptor } from '../utils';

@UseInterceptors(GatewayInterceptor)
@WebSocketGateway({ namespace: 'game' })
export default class GameGateway implements OnGatewayConnection {
  handleConnection(client: Socket): void {
    console.log('Client connected', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): string {
    console.log(client.id);
    return payload + ' game';
  }

  @SubscribeMessage('test')
  handleTest(client: Socket, payload: string): void {
    console.log('test', client.id, payload);
    throw new WsException('oh no error');
  }
}
