import {
  WebSocketGateway,
  OnGatewayConnection,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { BaseGateway } from '../utils/gateway-wrappers';

@WebSocketGateway({ namespace: 'game' })
export default class GameGateway
  extends BaseGateway
  implements OnGatewayConnection
{
  handleConnection(socket: Socket & { userId: string }): void {
    console.log('new client:', socket.userId);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): string {
    console.log(client.id);
    return payload + ' game';
  }

  @SubscribeMessage('test')
  handleTest(client: Socket, test: string): void {
    console.log('test', client.id, test);
    throw new WsException('oh no error');
  }
}
