import { Socket, Server } from 'socket.io';
import {
  OnGatewayDisconnect,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';

import { BaseGateway } from '../utils/gateway-wrappers';
import GameService from './game.service';

@WebSocketGateway({ namespace: 'game' })
export default class GameGateway
  extends BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  constructor(private readonly gameService: GameService) {
    super();
  }

  async handleConnection(socket: Socket & { userId: string }): Promise<void> {
    console.log('game conection', socket.id, socket.userId);
    await this.gameService.handleConnection(socket);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    console.log('game disconnect', socket.id);
    await this.gameService.handleDisconnect(socket);
  }

  afterInit(): void {
    this.gameService.server = this.server;
  }

  @SubscribeMessage('paddlePos')
  onPaddlePos(socket: Socket, pos: number): void {
    this.gameService.onPaddlePos(socket, pos);
  }
}