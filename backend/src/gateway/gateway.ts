import { Socket, Server } from 'socket.io';
import {
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NetProtocol, NetError, NetGameRoom, NetUser } from './protocols';
import { GameManager } from './Game/game';
import { UserManager } from './User/user';
import { ClientManager } from './Client/client';

@WebSocketGateway({
  // cors: { origin: ['localhost:3000'] },
  transports: ['websocket'],
})
export class Gateway implements OnGatewayDisconnect {
  private readonly globalChannel = '_global_';
  @WebSocketServer() private server: Server;

  constructor(
    private readonly gameMgr: GameManager,
    private readonly userMgr: UserManager,
    private readonly clientMgr: ClientManager,
  ) {}

  @SubscribeMessage('debug')
  onDebug(socket: Socket, path: string) {}

  handleDisconnect(socket: Socket) {
    const cl = this.clientMgr.getClient(socket.id);
    if (!cl) return;

    const name = cl.userName;
    const user = this.userMgr.getUser(name);

    // Remove from list of clients
    this.clientMgr.removeClient(socket.id);

    // If watching or in a game, remove as well
    const watchGameRoomId = cl.gameRoom();
    if (watchGameRoomId === user.playGameRoom()) {
      // client playing a game but quit
      this.userMgr.setGameRoom(name);
    }
    if (watchGameRoomId) {
      this.clientMgr.setGameRoom(socket.id);
    }
  }

  @SubscribeMessage(NetProtocol.setUsername)
  onSetUsername(socket: Socket, name: string): NetError | true {
    if (!name)
      return {
        errorMsg: 'Name is invalid',
        origin: {
          event: NetProtocol.setUsername,
          data: name,
        },
      };
    if (this.userMgr.newUser(name, socket.id)) {
      // User's first connection
      this.broadcast(this.globalChannel, NetProtocol.userOnline, name);
    }
    this.clientMgr.newClient(socket, name);
    this.clientMgr.setSubscription(socket.id, this.globalChannel, true);
    return true;
  }

  @SubscribeMessage(NetProtocol.requestGameRooms)
  onRequestGameRooms(): NetGameRoom[] {
    return this.gameMgr.getRooms();
  }

  @SubscribeMessage(NetProtocol.requestUsers)
  onRequestUserList(): NetUser[] {
    return this.userMgr.getUsers();
  }

  @SubscribeMessage(NetProtocol.sendChallenge)
  onSendChallenge(socket: Socket, opponentName: string): string | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.sendChallenge,
        data: opponentName,
      },
    });
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return error('You are not registered');

    // Check if user is not challenging himself
    if (opponentName === client.userName)
      return error('Why do you challenge yourself? Duh.');

    // Check if opponent is valid user
    if (!this.userMgr.getUser(opponentName))
      return error(`User ${opponentName} doesn't exist or isn't online`);

    // Check if user and opponent are already having an open challenge
    if (this.gameMgr.challengeExists(client.userName, opponentName))
      return error(`A challenge between you and ${opponentName} is still open`);

    // Add the challenge to global list & user's personal list
    const challengeId = this.gameMgr.newChallenge(
      client.userName,
      opponentName,
    );
    this.userMgr.setChallenge(client.userName, challengeId, true);
    this.userMgr.setChallenge(opponentName, challengeId, true);

    // Send challenge to opponent
    this.emitToUser(opponentName, NetProtocol.beingChallenged, client.userName);
    // Simply return opponent's name if everything is ok
    return opponentName;
  }

  @SubscribeMessage(NetProtocol.acceptChallenge)
  onAcceptChallenge(
    socket: Socket,
    challenger: string,
  ): void | string | NetError {}

  @SubscribeMessage(NetProtocol.closeChallenge)
  onCloseChallenge(socket: Socket, opponent: string) {}

  private emitToUser = (name: string, event: string, data?: any) => {
    // Emit a message to all connected clients of a user
    this.userMgr
      .getUser(name)
      .clients()
      .forEach((clientId) => {
        const client = this.clientMgr.getClient(clientId);
        client.socket.emit(event, data);
      });
  };

  private broadcast = (channel: string, event: string, data?: any) =>
    this.server.to(channel).emit(event, data);
}
