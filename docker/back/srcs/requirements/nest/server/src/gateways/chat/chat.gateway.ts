import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import ChatService from './chat.service';
import { ChallengeDto, GRAccessDto, GRRoleDto } from './chat.dto';
import { Void } from './chat.interface';
import { BaseGateway } from '../utils/gateway-wrappers';

// Messages that can be sent to the client
export const msgsToClient = {
  challenge: 'challenge',
  userNewRole: 'userNewRole',
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

  async handleConnection(socket: Socket & { userId: string }): Void {
    await this.chatService.handleConnection(socket);
  }

  async handleDisconnect(socket: Socket): Void {
    await this.chatService.handleDisconnect(socket);
  }

  /* GAMES MANAGEMENT */
  @SubscribeMessage('challenge')
  onChallenge(socket: Socket, { opponentName, action }: ChallengeDto): boolean {
    return this.chatService.onChallenge(socket, opponentName, action);
  }

  @SubscribeMessage('gameRoomAccess')
  async onGameRoomAccess(socket: Socket, { roomId, enter }: GRAccessDto): Void {
    await this.chatService.onGameRoomAccess(socket, enter, roomId);
  }

  @SubscribeMessage('gameRoomRole')
  onGameRoomRole(socket: Socket, { player }: GRRoleDto): boolean {
    return this.chatService.onGameRoomRole(socket, player);
  }
}
