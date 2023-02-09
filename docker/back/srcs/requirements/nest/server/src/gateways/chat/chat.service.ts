import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

import ClientsManager from '../clients-manager.service';
import UsersManager from '../users-manager.service';
import GamesManager from '../games-manager.service';

import { msgsToClient } from './chat.gateway';
import { NetGameRoomSetup } from '../utils/protocols';
import { challengeActions } from './chat.dto';
import {
  ChallengeDataInfos,
  ChallengeData,
  UserRoleData,
  Void,
} from './chat.interface';

@Injectable()
export default class ChatService {
  private readonly errorNotRegistered = 'You are not registered';

  server: Server;

  constructor(
    private readonly gameMgr: GamesManager,
    private readonly userMgr: UsersManager,
    private readonly clientMgr: ClientsManager,
  ) {}

  handleConnection(socket: Socket & { userId: string }): void {
    this.userMgr.newUser(socket.userId, socket.id);
    this.clientMgr.newClient(socket, socket.userId);
  }

  async handleDisconnect(socket: Socket): Void {
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return;

    const name = client.userName;
    const user = this.userMgr.getUser(name);

    // If watching or playing in a game, remove as well
    const watchGameRoomId = client.gameRoom();
    if (watchGameRoomId) await this.leaveGameRoom(socket.id);
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

  /* CHALLENGES */
  onChallenge(socket: Socket, opponentName: string, action: string): true {
    switch (action) {
      case challengeActions.send:
        return this.onSendChallenge(socket, opponentName);
      case challengeActions.accept:
        return this.onAcceptChallenge(socket, opponentName);
      case challengeActions.close:
        return this.onCloseChallenge(socket, opponentName);
      default:
        throw new WsException('Unknown action');
    }
  }

  private onSendChallenge(socket: Socket, opponentName: string): true {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) throw new WsException(this.errorNotRegistered);
    // Check if user is not challenging himself
    if (opponentName === client.userName)
      throw new WsException('Why do you challenge yourself? Duh.');
    // Check if opponent is valid user
    if (!this.userMgr.getUser(opponentName))
      throw new WsException(
        `User ${opponentName} doesn't exist or isn't online`,
      );
    // Check if a challenge between users are not yet opened
    if (this.gameMgr.challengeExists(client.userName, opponentName))
      throw new WsException(
        `A challenge between you and ${opponentName} is still open`,
      );

    // Add the challenge to global list & user's personal list
    const challengeId = this.gameMgr.newChallenge(
      client.userName,
      opponentName,
    );
    this.userMgr.setChallenge(client.userName, challengeId, true);
    this.userMgr.setChallenge(opponentName, challengeId, true);
    // Send challenge to opponent
    const data: ChallengeData = {
      info: ChallengeDataInfos.new,
      opponentName: client.userName,
    };
    this.emitToUser(opponentName, msgsToClient.challenge, data);
    return true;
  }

  private onAcceptChallenge(socket: Socket, opponentName: string): true {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) throw new WsException(this.errorNotRegistered);
    // Check if a challenge exists
    if (!this.gameMgr.challengeExists(client.userName, opponentName))
      throw new WsException(
        `No challenge exists between you and ${opponentName}`,
      );
    // Check if user is the one being challenged (challenger cannot auto-accept)
    const challenge = this.gameMgr.getChallenge(client.userName, opponentName);
    if (client.userName !== challenge.toName)
      throw new WsException(`You are not the one who is being challenge`);
    // Check if room can be created (both players are not playing)
    if (!this.gameMgr.canCreateRoom(client.userName, opponentName))
      throw new WsException(
        `Both you and ${opponentName} must be free to play`,
      );
    // Close challenge, execute routines that create new game room
    this.closeChallenge(challenge.fromName, challenge.toName, client.userName);
    return this.acceptChallenge(challenge.fromName, challenge.toName);
  }

  private onCloseChallenge(socket: Socket, opponentName: string): true {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) throw new WsException(this.errorNotRegistered);
    // Check if a challenge exists
    if (!this.gameMgr.challengeExists(client.userName, opponentName))
      throw new WsException(
        `No challenge exists between you and ${opponentName}`,
      );
    // Check if user is one of the parties of challenge
    const challenge = this.gameMgr.getChallenge(client.userName, opponentName);
    if (![challenge.fromName, challenge.toName].includes(client.userName))
      throw new WsException(`You don't have the right to close this challenge`);
    return this.closeChallenge(
      challenge.fromName,
      challenge.toName,
      client.userName,
    );
  }

  /* GAME ROOMS MANAGEMENT */
  async onGameRoomAccess(
    sock: Socket,
    join: boolean,
    roomId?: string,
  ): Promise<NetGameRoomSetup | true> {
    if (join) return await this.onEnterGameRoom(sock, roomId);
    else return await this.onLeaveGameRoom(sock);
  }

  private async onEnterGameRoom(
    socket: Socket,
    roomId: string,
  ): Promise<NetGameRoomSetup> {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) throw new WsException(this.errorNotRegistered);
    // Check if room is valid
    if (!this.gameMgr.getRoom(roomId)) throw new WsException('Invalid room');
    // Check if client is already watching game in a room
    if (client.gameRoom())
      throw new WsException(
        'Quit your current game room first before entering a new one',
      );
    // Client join room
    const clientCanPlay = await this.clientMgr.enterGameRoom(socket.id, roomId);

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

  private async onLeaveGameRoom(socket: Socket): Promise<true> {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) throw new WsException(this.errorNotRegistered);
    // Check if client is currently in a room
    if (!client.gameRoom())
      throw new WsException(
        'You must be in a room in order to quit from it, no?',
      );
    await this.leaveGameRoom(socket.id);
    return true;
  }

  onGameRoomRole(socket: Socket, player: boolean): true {
    if (player) return this.onPlayerSit(socket);
    else return this.onPlayerStand(socket);
  }

  private onPlayerSit(socket: Socket): true {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) throw new WsException(this.errorNotRegistered);
    // Check if client is in a game room
    if (!client.gameRoom()) throw new WsException('You are not in a game room');
    // Check if client can join as player
    if (!this.clientMgr.canPlay(socket.id))
      throw new WsException(
        'You are not a player, or there can only be one controller for your player',
      );
    // Let client take control of the player
    this.gameMgr.playerSit(client.userName, socket.id, client.gameRoom());
    // Inform others
    const data: UserRoleData = {
      userName: client.userName,
      player: true,
    };
    this.broadcast(client.gameRoom(), msgsToClient.userNewRole, data);
    return true;
  }

  private onPlayerStand(socket: Socket): true {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) throw new WsException(this.errorNotRegistered);
    // Check if client is in a game room
    if (!client.gameRoom()) throw new WsException('You are not in a game room');
    // Check if client is one of the players
    const roomId = client.gameRoom();
    const room = this.gameMgr.getRoom(roomId);
    const player = room.getPlayer(client.userName);
    if (!player || player.clientId() !== socket.id)
      throw new WsException(
        'You are not controlling any player in this game room',
      );
    // Make player stand
    this.gameMgr.playerStand(client.userName);
    // Inform others
    const data: UserRoleData = {
      userName: client.userName,
      player: false,
    };
    this.broadcast(roomId, msgsToClient.userNewRole, data);
    return true;
  }

  private broadcast = (chan: string, event: string, data?: object): boolean =>
    this.server.to(chan).emit(event, data);

  private emitToUser = (name: string, event: string, data?: object): void => {
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
  ): true => {
    const data: ChallengeData = {
      info: ChallengeDataInfos.closed,
      opponentName: userName2,
    };
    // Send notification to all clients of related to users
    if (userName1 !== skipName)
      this.emitToUser(userName1, msgsToClient.challenge, data);
    if (userName2 !== skipName) {
      data.opponentName = userName1;
      this.emitToUser(userName2, msgsToClient.challenge, data);
    }
    // Remove challenge from list
    return this.gameMgr.removeChallenge(userName1, userName2);
  };

  private acceptChallenge = (fromName: string, toName: string): true => {
    const roomId = this.gameMgr.newRoom(fromName, toName);
    // Invite both players to game room
    const data: ChallengeData = {
      info: ChallengeDataInfos.accepted,
      opponentName: toName,
      gameId: roomId,
    };
    this.emitToUser(fromName, msgsToClient.challenge, data);
    data.opponentName = fromName;
    this.emitToUser(toName, msgsToClient.challenge, data);
    return true;
  };

  private leaveGameRoom = async (clientId: string): Promise<boolean> => {
    const client = this.clientMgr.getClient(clientId);
    const roomId = client.gameRoom();
    const room = this.gameMgr.getRoom(roomId);
    const player = room.getPlayer(client.userName);
    // If client is a player, make him stand up first
    if (player && player.clientId() === clientId) {
      this.gameMgr.playerStand(client.userName);
      // Inform others
      const data: UserRoleData = {
        userName: client.userName,
        player: false,
      };
      this.broadcast(roomId, msgsToClient.userNewRole, data);
    }
    // Make client leave
    await this.clientMgr.leaveGameRoom(clientId);
    return true;
  };
}
