import { UseInterceptors } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { GatewayInterceptor } from '../utils';

@UseInterceptors(GatewayInterceptor)
@WebSocketGateway({ namespace: 'chat' })
export default class ChatGateway implements OnGatewayConnection {
  handleConnection(client: Socket): void {
    console.log('Client connected', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): string {
    console.log(client.id);
    return payload + ' chat';
  }
}
