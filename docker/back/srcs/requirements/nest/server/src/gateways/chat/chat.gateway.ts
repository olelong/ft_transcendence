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
import {
  ChallengeDto,
  GRAccessDto,
  MatchmakingDto,
  UserStatusDto,
} from './chat.dto';
import { BaseGateway } from '../utils/gateway-wrappers';
import { UserStatusData } from './chat.interface';

// Messages that can be sent to the client
export const msgsToClient = {
  challenge: 'challenge',
  matchmaking: 'matchmaking',
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

  @SubscribeMessage('game-room')
  async onGameRoomAccess(
    socket: Socket,
    { join, roomId }: GRAccessDto,
  ): Promise<true> {
    return await this.chatService.onGameRoomAccess(socket, join, roomId);
  }

  @SubscribeMessage('matchmaking')
  onMatchmaking(socket: Socket, { join }: MatchmakingDto): true {
    return this.chatService.onMatchmaking(socket, join);
  }

  /* USER INFOS */
  @SubscribeMessage('user:status')
  async onUserStatus(
    socket: Socket,
    { users }: UserStatusDto,
  ): Promise<UserStatusData> {
    return await this.chatService.onUserStatus(socket, users);
  }
}
