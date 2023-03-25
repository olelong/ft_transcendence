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
  ChannelMsgDto,
  GRAccessDto,
  MatchmakingDto,
  UserMsgDto,
  UserSanctionDto,
  UserStatusDto,
} from './chat.dto';
import { BaseGateway } from '../utils/gateway-wrappers';
import { True } from './chat.interface';
import { Cron, CronExpression } from '@nestjs/schedule';

// Messages that can be sent to the client
export const msgsToClient = {
  challenge: 'challenge',
  matchmaking: 'matchmaking',
  channelMessage: 'message:channel',
  userMessage: 'message:user',
  userStatus: 'user:status',
  userSanction: 'user:sanction',
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
    this.chatService.afterInit(this.server);
  }

  async handleConnection(socket: Socket & { userId: string }): Promise<void> {
    await this.chatService.handleConnection(socket);
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
  onGameRoomAccess(socket: Socket, { join, roomId }: GRAccessDto): True {
    return this.chatService.onGameRoomAccess(socket, join, roomId);
  }

  @SubscribeMessage('matchmaking')
  onMatchmaking(socket: Socket, { join }: MatchmakingDto): true {
    return this.chatService.onMatchmaking(socket, join);
  }

  /* MESSAGES */
  @SubscribeMessage('message:channel')
  onChannelMessage(socket: Socket, { id, content }: ChannelMsgDto): True {
    return this.chatService.onChannelMessage(socket, id, content);
  }

  @SubscribeMessage('message:user')
  onUserMessage(socket: Socket, { id, content }: UserMsgDto): True {
    return this.chatService.onUserMessage(socket, id, content);
  }

  /* USER INFOS */
  @SubscribeMessage('user:status')
  onUserStatus(socket: Socket, { users }: UserStatusDto): True {
    return this.chatService.onUserStatus(socket, users);
  }

  @SubscribeMessage('user:sanction')
  onUserSanction(socket: Socket, body: UserSanctionDto): True {
    return this.chatService.onUserSanction(socket, body);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleUnbanUnmute(): Promise<void> {
    await this.chatService.handleUnbanUnmute();
  }
}
