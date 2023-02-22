import { Socket, Server } from 'socket.io';
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';

import { BaseGateway } from '../utils/gateway-wrappers';
import GameService from './game.service';
import { UpdateDto } from './game.dto';

// Messages that can be sent to the client
export const msgsToClient = {
  init: 'init',
  update: 'update',
};

@WebSocketGateway({ namespace: 'game' })
export default class GameGateway
  extends BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  constructor(private readonly gameService: GameService) {
    super();
  }
  afterInit(): void {
    this.gameService.server = this.server;
  }

  async handleConnection(socket: Socket & { userId: string }): Promise<void> {
    await this.gameService.handleConnection(socket);
  }
  async handleDisconnect(socket: Socket): Promise<void> {
    await this.gameService.handleDisconnect(socket);
  }

  @SubscribeMessage('update')
  onPaddlePos(socket: Socket, { paddlePos }: UpdateDto): true {
    return this.gameService.onPaddlePos(socket, paddlePos);
  }
}
