import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import ClientsManager from '../managers/clients-manager.service';
import UsersManager from '../managers/users-manager.service';
import GamesManager from '../managers/games-manager.service';
import PrismaService from '../../prisma/prisma.service';

import { msgsToClient } from './chat.gateway';
import { challengeActions } from './chat.dto';
import {
  ChallengeDataInfos,
  ChallengeData,
  MatchmakingData,
  UserStatusData,
} from './chat.interface';

@Injectable()
export default class ChatService {
  private readonly errorNotRegistered = 'You are not registered';

  server: Server;
  mmQueue: string[] = [];

  constructor(
    private readonly gameMgr: GamesManager,
    private readonly userMgr: UsersManager,
    private readonly clientMgr: ClientsManager,
    private readonly prisma: PrismaService,
  ) {}

  handleConnection(socket: Socket & { userId: string }): void {
    this.userMgr.newUser(socket.userId, socket.id);
    this.clientMgr.newClient(socket, socket.userId);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return;

    const name = client.userName;
    const user = this.userMgr.getUser(name);

    // If the user is in matchmaking mode, we need to remove it from the queue.
    const index = this.mmQueue.findIndex((userName) => userName === name);
    if (index > -1) this.mmQueue.splice(index, 1);

    if (!user.watchGameRoom() && !user.playGameRoom())
      // If watching or playing in a game, remove as well
      await this.leaveGameRoom(socket.id);
    // TODO if client quits a game room that it is a player, inform other clients of
    // the same user to take over

    // User logs out when all of its clients have left
    if (this.userMgr.setClient(name, socket.id, false) === 0) {
      // Close all open challenges & notify other parties
      user.challenges().forEach((id) => {
        const challenge = this.gameMgr.getChallengeById(id);
        this.closeChallenge(challenge.fromName, challenge.toName, name);
      });
      if (!user.playGameRoom() && !user.watchGameRoom())
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
    this.acceptChallenge(challenge.fromName, challenge.toName);
    return true;
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
    socket: Socket,
    join: boolean,
    roomId?: string,
  ): Promise<true> {
    if (join) return await this.onEnterGameRoom(socket, roomId);
    else return await this.onLeaveGameRoom(socket);
  }

  private async onEnterGameRoom(socket: Socket, roomId: string): Promise<true> {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) throw new WsException(this.errorNotRegistered);
    // Check if room is valid
    const room = this.gameMgr.getRoom(roomId);
    if (!room) throw new WsException('Invalid room');
    // Check if game is ended
    if (room.engine.extState.ended) throw new WsException('Game ended');
    // Check if client is already watching game in a room
    const user = this.userMgr.getUser(client.userName);
    if (user.watchGameRoom() || user.playGameRoom())
      throw new WsException(
        'Quit your current game room first before entering a new one',
      );
    // Client join room
    const clientCanPlay = await this.clientMgr.enterGameRoom(socket.id, roomId);
    if (clientCanPlay) {
      user.setGameRoom(roomId);
      this.gameMgr.userSit(client.userName, user.playGameRoom());
    } else user.setWatchRoom(roomId);
    return true;
  }

  private async onLeaveGameRoom(socket: Socket): Promise<true> {
    // Check if client is registered
    const client = this.clientMgr.getClient(socket.id);
    if (!client) throw new WsException(this.errorNotRegistered);
    // Check if client is currently in a room
    const user = this.userMgr.getUser(client.userName);
    if (!user.watchGameRoom() && !user.playGameRoom())
      throw new WsException(
        'You must be in a room in order to quit from it, no?',
      );
    const roomId = user.watchGameRoom() || user.playGameRoom();
    const room = this.gameMgr.getRoom(roomId);
    const player = room.getPlayer(client.userName);
    // If client is a player and is in game, he cannot leave the room
    if (
      player &&
      player.clientId() === socket.id &&
      !room.engine.extState.ended
    )
      throw new WsException(
        "You're not allowed to quit this room, keep playing! ( •̀ᴗ•́ )و ̑̑",
      );
    await this.leaveGameRoom(socket.id);
    return true;
  }

  onMatchmaking(socket: Socket, join: boolean): true {
    const client = this.clientMgr.getClient(socket.id);
    if (join) {
      if (!this.mmQueue.find((userName) => client.userName === userName))
        this.mmQueue.push(client.userName);
      if (this.mmQueue.length >= 2) {
        const user1 = this.mmQueue.shift();
        const user2 = this.mmQueue.shift();
        const roomId = this.gameMgr.newRoom(user1, user2);
        const data: MatchmakingData = {
          opponentName: user2,
          gameId: roomId,
        };
        this.emitToUser(user1, msgsToClient.matchmaking, data);
        data.opponentName = user1;
        this.emitToUser(user2, msgsToClient.matchmaking, data);
      }
    } else {
      const index = this.mmQueue.findIndex(
        (userName) => userName === client.userName,
      );
      if (index > -1) this.mmQueue.splice(index, 1);
    }
    return true;
  }

  async onUserStatus(socket: Socket, users: string[]): Promise<UserStatusData> {
    const client = this.clientMgr.getClient(socket.id);
    const user = await this.prisma.user.findUnique({
      where: { id: client.userName },
      include: {
        blocked: {
          select: { id: true },
        },
        blockedBy: {
          select: { id: true },
        },
      },
    });
    const blocks = user.blocked.concat(user.blockedBy);
    const statusUsers: UserStatusData['users'] = [];
    users.forEach((userId) => {
      const statusUser = { id: userId, status: 'offline' };
      if (!blocks.find((block) => block.id === userId)) {
        const user = this.userMgr.getUser(userId);
        if (user) {
          if (user.playGameRoom()) statusUser.status = 'ingame';
          else statusUser.status = 'online';
        }
      }
      statusUsers.push(statusUser);
    });
    return { users: statusUsers };
  }

  private emitToUser = (name: string, event: string, data: object): void => {
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
      opponentName: fromName,
      gameId: roomId,
    };
    this.emitToUser(toName, msgsToClient.challenge, data);

    data.opponentName = toName;
    this.emitToUser(fromName, msgsToClient.challenge, data);
    return true;
  };

  private leaveGameRoom = async (clientId: string): Promise<true> => {
    const client = this.clientMgr.getClient(clientId);
    // Make client leave
    await this.clientMgr.leaveGameRoom(clientId);
    const user = this.userMgr.getUser(client.userName);
    user.setGameRoom(null);
    user.setWatchRoom(null);
    return true;
  };
}