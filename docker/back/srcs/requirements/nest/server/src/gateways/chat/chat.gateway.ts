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
import { NetGameRoomSetup } from '../utils/protocols';

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

  handleConnection(socket: Socket & { userId: string }): void {
    this.chatService.handleConnection(socket);
  }

  async handleDisconnect(socket: Socket): Void {
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
  ): Promise<NetGameRoomSetup | true> {
    return await this.chatService.onGameRoomAccess(socket, join, roomId);
  }

  @SubscribeMessage('gameRoomRole')
  onGameRoomRole(socket: Socket, { player }: GRRoleDto): true {
    return this.chatService.onGameRoomRole(socket, player);
  }
}
