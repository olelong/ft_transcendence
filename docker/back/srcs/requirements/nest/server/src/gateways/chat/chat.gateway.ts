import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import ChatService from './chat.service';
import { ChallengeDto, GRAccessDto } from './chat.dto';
import { BaseGateway } from '../utils/gateway-wrappers';

// Messages that can be sent to the client
export const msgsToClient = {
  challenge: 'challenge',
  watcherUpdate: 'watcherUpdate',
};

@WebSocketGateway({ namespace: 'chat' })
export default class ChatGateway
  extends BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  constructor(private readonly chatService: ChatService) {
    super();
  }

  afterInit(): void {
    this.chatService.server = this.server;
  }

  handleConnection(socket: Socket & { userId: string }): void {
    this.chatService.handleConnection(socket);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    await this.chatService.handleDisconnect(socket);
  }

  /* GAMES MANAGEMENT */
  @SubscribeMessage('challenge')
  onChallenge(socket: Socket, { opponentName, action }: ChallengeDto): true {
    return this.chatService.onChallenge(socket, opponentName, action);
  }

  @SubscribeMessage('gameRoomAccess')
  async onGameRoomAccess(
    socket: Socket,
    { roomId, join }: GRAccessDto,
  ): Promise<true> {
    return await this.chatService.onGameRoomAccess(socket, join, roomId);
  }
}
