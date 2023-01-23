import { Socket, Server } from 'socket.io';
import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  NetProtocol,
  NetError,
  NetGameRoom,
  NetUser,
  NetGameRoomSetup,
} from './protocols';
import { GameManager } from './Game/game';
import { UserManager } from './User/user';
import { ClientManager } from './Client/client';

@WebSocketGateway({
  // cors: { origin: ['localhost:3000'] },
  transports: ['websocket'],
})
export class Gateway implements OnGatewayDisconnect {
  private readonly errorNotRegistered = 'You are not registered';

  private readonly globalChannel = '_global_';
  @WebSocketServer() private server: Server;

  constructor(
    private readonly gameMgr: GameManager,
    private readonly userMgr: UserManager,
    private readonly clientMgr: ClientManager,
  ) {
    // test code here if needed
  }

  @SubscribeMessage('debug')
  onDebug(socket: Socket, path: string) {
    let res = this;
    for (const p of path.split(' ')) res = res[p];

    const head = '=== ' + path + ' ===';
    console.clear();
    console.log(head);
    console.log(res);
    console.log('='.repeat(head.length));
  }

  handleDisconnect(socket: Socket) {
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return;

    const name = client.userName;
    const user = this.userMgr.getUser(name);

    // If watching or playing in a game, remove as well
    const watchGameRoomId = client.gameRoom();
    if (watchGameRoomId) this.leaveGameRoom(socket.id);
    // TODO if client quits a game room that it is a player, inform other clients of
    // the same user to take over

    // User logs out when all of its clients have left
    if (this.userMgr.setClient(name, socket.id, false) === 0) {
      // Close all open challenges & notify other parties
      user.challenges().forEach((id) => {
        const challenge = this.gameMgr.getChallengeById(id);
        this.closeChallenge(challenge.fromName, challenge.toName, name);
      });
      // Remove from list of users
      this.userMgr.removeUser(name);
    }
    // Remove from list of clients
    this.clientMgr.removeClient(socket.id);
  }

  @SubscribeMessage(NetProtocol.setUsername)
  onSetUsername(socket: Socket, name: string): true | NetError {
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
    const client = this.clientMgr.newClient(socket, name);
    client.subscribe(this.globalChannel);
    return true;
  }

  @SubscribeMessage(NetProtocol.requestGameRooms)
  onRequestGameRooms(socket: Socket, data?: any): NetGameRoom[] | NetError {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client)
      return {
        errorMsg: this.errorNotRegistered,
        origin: {
          event: NetProtocol.enterGameRoom,
          data: data,
        },
      };
    return this.gameMgr.getRooms();
  }

  @SubscribeMessage(NetProtocol.requestUsers)
  onRequestUserList(socket: Socket, data?: any): NetUser[] | NetError {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client)
      return {
        errorMsg: this.errorNotRegistered,
        origin: {
          event: NetProtocol.enterGameRoom,
          data: data,
        },
      };
    return this.userMgr.getUsers();
  }

  @SubscribeMessage(NetProtocol.sendChallenge)
  onSendChallenge(socket: Socket, opponentName: string): true | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.sendChallenge,
        data: opponentName,
      },
    });
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return error(this.errorNotRegistered);
    // Check if user is not challenging himself
    if (opponentName === client.userName)
      return error('Why do you challenge yourself? Duh.');
    // Check if opponent is valid user
    if (!this.userMgr.getUser(opponentName))
      return error(`User ${opponentName} doesn't exist or isn't online`);
    // Check if a challenge between users are not yet opened
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
    this.emitToUser(opponentName, NetProtocol.sendChallenge, client.userName);
    return true;
  }

  @SubscribeMessage(NetProtocol.acceptChallenge)
  onAcceptChallenge(socket: Socket, opponentName: string): boolean | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.acceptChallenge,
        data: opponentName,
      },
    });
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return error(this.errorNotRegistered);
    // Check if a challenge exists
    if (!this.gameMgr.challengeExists(client.userName, opponentName))
      return error(`No challenge exists between you and ${opponentName}`);
    // Check if user is the one being challenged (challenger cannot auto-accept)
    const challenge = this.gameMgr.getChallenge(client.userName, opponentName);
    if (client.userName !== challenge.toName)
      return error(`You are not the one who is being challenge`);
    // Check if room can be created (both players are not playing)
    if (!this.gameMgr.canCreateRoom(client.userName, opponentName))
      return error(`Both you and ${opponentName} must be free to play`);
    // Close challenge, execute routines that create new game room
    this.closeChallenge(challenge.fromName, challenge.toName, client.userName);
    return this.acceptChallenge(challenge.fromName, challenge.toName);
  }

  @SubscribeMessage(NetProtocol.closeChallenge)
  onCloseChallenge(socket: Socket, opponentName: string): boolean | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.closeChallenge,
        data: opponentName,
      },
    });
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return error(this.errorNotRegistered);
    // Check if a challenge exists
    if (!this.gameMgr.challengeExists(client.userName, opponentName))
      return error(`No challenge exists between you and ${opponentName}`);
    // Check if user is one of the parties of challenge
    const challenge = this.gameMgr.getChallenge(client.userName, opponentName);
    if (![challenge.fromName, challenge.toName].includes(client.userName))
      return error(`You don't have the right to close this challenge`);
    return this.closeChallenge(
      challenge.fromName,
      challenge.toName,
      client.userName,
    );
  }

  @SubscribeMessage(NetProtocol.enterGameRoom)
  onEnterGameRoom(socket: Socket, roomId: string): NetGameRoomSetup | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.enterGameRoom,
        data: roomId,
      },
    });
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return error(this.errorNotRegistered);
    // Check if room is valid
    if (!this.gameMgr.getRoom(roomId)) return error('Invalid room');
    // Check if client is already watching game in a room
    if (client.gameRoom())
      return error(
        'Quit your current game room first before entering a new one',
      );
    // Client join room
    const clientCanPlay = this.clientMgr.enterGameRoom(socket.id, roomId);

    // TODO return real game state
    const room = this.gameMgr.getRoom(roomId);
    const initState = this.gameMgr.engine.initState;
    const players = {
      players: [
        {
          name: room.player1.name,
          hasController: room.player1.clientId() !== null,
        },
        {
          name: room.player2.name,
          hasController: room.player2.clientId() !== null,
        },
      ],
      clientCanPlay: clientCanPlay,
      started: false,
    };
    return { ...initState, ...players };
  }

  @SubscribeMessage(NetProtocol.leaveGameRoom)
  onLeaveGameRoom(socket: Socket, data?: any): true | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.leaveGameRoom,
        data: data,
      },
    });
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return error(this.errorNotRegistered);
    // Check if client is currently in a room
    if (!client.gameRoom())
      return error('You must be in a room in order to quit from it, no?');
    this.leaveGameRoom(socket.id);
    return true;
  }

  @SubscribeMessage(NetProtocol.playerSit)
  onPlayerSit(socket: Socket, data?: any): boolean | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.playerSit,
        data: data,
      },
    });
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return error(this.errorNotRegistered);
    // Check if client is in a game room
    if (!client.gameRoom()) return error('You are not in a game room');
    // Check if client can join as player
    if (!this.clientMgr.canPlay(socket.id))
      return error(
        'You are not a player, or there can only be one controller for your player',
      );
    // Let client take control of the player
    this.gameMgr.playerSit(client.userName, socket.id, client.gameRoom());
    // Inform others
    this.broadcast(client.gameRoom(), NetProtocol.playerSit, client.userName);
    return true;
  }

  @SubscribeMessage(NetProtocol.playerStand)
  onPlayerStand(socket: Socket, data?: any): true | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.playerStand,
        data: data,
      },
    });
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return error(this.errorNotRegistered);
    // Check if client is in a game room
    if (!client.gameRoom()) return error('You are not in a game room');
    // Check if client is one of the players
    const roomId = client.gameRoom();
    const room = this.gameMgr.getRoom(roomId);
    const player = room.getPlayer(client.userName);
    if (!player || player.clientId() !== socket.id)
      return error('You are not controlling any player in this game room');
    // Make player stand
    this.gameMgr.playerStand(client.userName);
    // Inform others
    this.broadcast(roomId, NetProtocol.playerStand, client.userName);
    return true;
  }

  private broadcast = (channel: string, event: string, data?: any) =>
    this.server.to(channel).emit(event, data);

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

  private closeChallenge = (
    userName1: string,
    userName2: string,
    skipName?: string,
  ) => {
    // Send notification to all clients of related to users
    if (userName1 !== skipName)
      this.userMgr
        .getUser(userName1)
        .clients()
        .forEach((clientId) => {
          this.clientMgr
            .getClient(clientId)
            .socket.emit(NetProtocol.closeChallenge, userName2);
        });
    if (userName2 !== skipName)
      this.userMgr
        .getUser(userName2)
        .clients()
        .forEach((clientId) => {
          this.clientMgr
            .getClient(clientId)
            .socket.emit(NetProtocol.closeChallenge, userName1);
        });
    // Remove challenge from list
    return this.gameMgr.removeChallenge(userName1, userName2);
  };

  private acceptChallenge = (fromName: string, toName: string) => {
    const roomId = this.gameMgr.newRoom(fromName, toName);
    // Inform everyone about new game room
    this.broadcast(
      this.globalChannel,
      NetProtocol.gameRoomCreated,
      this.gameMgr.getRoom(roomId).obj(roomId),
    );
    // Invite both players to game room
    this.emitToUser(fromName, NetProtocol.gameRoomInvitation, roomId);
    this.emitToUser(toName, NetProtocol.gameRoomInvitation, roomId);
    return true;
  };

  private leaveGameRoom = (clientId: string) => {
    const client = this.clientMgr.getClient(clientId);
    const roomId = client.gameRoom();
    const room = this.gameMgr.getRoom(roomId);
    const player = room.getPlayer(client.userName);
    // If client is a player, make him stand up first
    if (player && player.clientId() === clientId) {
      this.gameMgr.playerStand(client.userName);
      // Inform others
      this.broadcast(roomId, NetProtocol.playerStand, client.userName);
    }
    // Make client leave
    this.clientMgr.leaveGameRoom(clientId);
    return true;
  };
}
