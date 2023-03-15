import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import ClientsManager from '../managers/clients-manager.service';
import UsersManager from '../managers/users-manager.service';
import GamesManager from '../managers/games-manager.service';
import PrismaService from '../../prisma/prisma.service';

import { msgsToClient } from './chat.gateway';
import { challengeActions, UserSanctionDto } from './chat.dto';
import {
  True,
  ChallengeDataInfos,
  ChallengeData,
  MatchmakingData,
  ChannelMsgData,
  UserMsgData,
  UserStatusData,
  UserSanctionData,
} from './chat.interface';
import { NetError } from '../utils/protocols';

@Injectable()
export default class ChatService {
  private readonly errorNotRegistered = 'You are not registered';
  private mmQueue: string[] = [];
  private server: Server;

  constructor(
    private readonly gameMgr: GamesManager,
    private readonly userMgr: UsersManager,
    private readonly clientMgr: ClientsManager,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server): void {
    this.server = server;
    this.gameMgr.sendStatus = (name: string, data: UserStatusData): void => {
      this.broadcast(name, msgsToClient.userStatus, data);
    };
  }

  async handleConnection(socket: Socket & { userId: string }): Promise<void> {
    const error = (msg: string): void => {
      const err: NetError = {
        errorMsg: msg,
        origin: {
          event: 'connection',
          data: null,
        },
      };
      socket.emit('error', err);
      socket.disconnect();
    };
    this.userMgr.newUser(socket.userId, socket.id);
    const user = this.userMgr.getUser(socket.userId);
    const client = this.clientMgr.newClient(socket, socket.userId);
    const userDb = await this.prisma.user.findUnique({
      where: { id: socket.userId },
      include: { channels: true },
    });
    if (userDb) {
      for (const c of userDb.channels)
        await client.subscribe(c.chanId.toString());
      const gameRoom = user.playGameRoom();
      if (!gameRoom) this.tellUserIsOnline(socket.userId);
      else {
        const data: UserStatusData = {
          id: socket.userId,
          status: 'ingame',
          gameid: gameRoom,
        };
        this.broadcast(socket.userId, msgsToClient.userStatus, data);
      }
    } else error('User not found, please login');
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
      await this.leaveGameRoom(socket.id, false);
    // TODO if client quits a game room that it is a player, inform other clients of
    // the same user to take over

    // User logs out when all of its clients have left
    if (this.userMgr.setClient(name, socket.id, false) === 0) {
      // Close all open challenges & notify other parties
      user.challenges().forEach((id) => {
        const challenge = this.gameMgr.getChallengeById(id);
        this.closeChallenge(challenge.fromName, challenge.toName, name);
      });
      if (!user.playGameRoom() && !user.watchGameRoom()) {
        // Remove from list of users
        this.userMgr.removeUser(name);
        const data: UserStatusData = {
          id: name,
          status: 'offline',
        };
        this.broadcast(name, msgsToClient.userStatus, data);
      }
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
  async onGameRoomAccess(socket: Socket, join: boolean, roomId?: string): True {
    if (join) return await this.onEnterGameRoom(socket, roomId);
    else return await this.onLeaveGameRoom(socket);
  }

  private async onEnterGameRoom(socket: Socket, roomId: string): True {
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
      const data: UserStatusData = {
        id: client.userName,
        status: 'ingame',
        gameid: roomId,
      };
      this.broadcast(client.userName, msgsToClient.userStatus, data);
    } else user.setWatchRoom(roomId);
    return true;
  }

  private async onLeaveGameRoom(socket: Socket): True {
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

  /* MESSAGES */
  async onChannelMessage(socket: Socket, id: number, content: string): True {
    const channel = await this.prisma.pMChannel.findUnique({
      where: { id },
      include: { members: true, banned: true },
    });
    if (!channel) throw new WsException('Channel does not exist');
    const client = this.clientMgr.getClient(socket.id);
    const member = channel.members.find((m) => m.userId === client.userName);
    if (!member) throw new WsException('You are not a member of this channel');
    if (member.role === 'MUTED')
      throw new WsException(
        'You are muted from this channel' +
          (member.time ? ' until ' + member.time.toISOString() : ''),
      );
    const banned = channel.banned.find((b) => b.userId === client.userName);
    if (banned)
      throw new WsException(
        'You are banned from this channel' +
          (banned.time ? ' until ' + banned.time.toISOString() : ''),
      );
    const msg = await this.prisma.pMMessage.create({
      data: {
        chanId: channel.id,
        time: new Date(),
        senderId: client.userName,
        content,
      },
    });
    const sender = await this.prisma.user.findUnique({
      where: { id: client.userName },
      select: { id: true, name: true, avatar: true },
    });
    const data: ChannelMsgData = {
      chanid: channel.id,
      id: msg.id,
      sender,
      content,
      time: msg.time,
    };
    this.broadcast(channel.id.toString(), msgsToClient.channelMessage, data);
    return true;
  }

  async onUserMessage(socket: Socket, id: string, content: string): True {
    const client = this.clientMgr.getClient(socket.id);
    if (id === client.userName)
      throw new WsException('You can not chat with yourself');
    const friend = await this.prisma.user.findFirst({
      where: {
        AND: [
          { id },
          { friends: { some: { id: client.userName } } },
          { friendOf: { some: { id: client.userName } } },
        ],
      },
    });
    if (!friend) throw new WsException('You are not friend with ' + id);
    const users = [client.userName, id].sort();
    let dmChannel = await this.prisma.dMChannel.findFirst({
      where: { AND: [{ userId1: users[0] }, { userId2: users[1] }] },
    });
    if (!dmChannel)
      dmChannel = await this.prisma.dMChannel.create({
        data: { userId1: users[0], userId2: users[1] },
      });
    const msg = await this.prisma.dMMessage.create({
      data: {
        chanId: dmChannel.id,
        time: new Date(),
        senderId: client.userName,
        content,
      },
    });
    const data: UserMsgData = {
      id: msg.id,
      senderid: client.userName,
      content,
      time: new Date(),
    };
    this.emitToUser(friend.id, msgsToClient.userMessage, data);
    return true;
  }

  /* USER INFOS */
  async onUserStatus(socket: Socket, users: string[]): True {
    const client = this.clientMgr.getClient(socket.id);
    for (const user of users) await client.subscribe(user);
    users.forEach((userId) => {
      const user = this.userMgr.getUser(userId);
      const data: UserStatusData = {
        id: userId,
        status: 'offline',
      };
      if (user) {
        const gameRoom = user.playGameRoom();
        if (!gameRoom) data.status = 'online';
        else {
          data.status = 'ingame';
          data.gameid = gameRoom;
        }
      }
      socket.emit(msgsToClient.userStatus, data);
    });
    return true;
  }

  async onUserSanction(
    socket: Socket,
    { id, userid, type, add, time }: UserSanctionDto,
  ): True {
    const channel = await this.prisma.pMChannel.findUnique({
      where: { id },
      include: { members: true, banned: true },
    });
    if (!channel) throw new WsException('Channel does not exist');
    const client = this.clientMgr.getClient(socket.id);
    const member = channel.members.find((m) => m.userId === client.userName);
    if (member.role !== 'ADMIN' && member.role !== 'OWNER')
      throw new WsException('You are not admin of this channel');
    const sanctionMbr = channel.members.find((m) => m.userId === userid);
    const sanctionBan = channel.banned.find((b) => b.userId === userid);
    if (!sanctionMbr && !sanctionBan)
      throw new WsException(userid + ' is not affiliated with this channel');
    if (
      sanctionMbr &&
      (sanctionMbr.role === 'ADMIN' || sanctionMbr.role === 'OWNER')
    )
      throw new WsException(userid + ' is ' + sanctionMbr.role.toLowerCase());
    if (time && add && (type === 'mute' || type === 'ban'))
      if (new Date(time).getTime() < new Date().getTime())
        throw new WsException('You must provide a future time');
    if (add === false) {
      switch (type) {
        case 'mute':
          if (sanctionMbr)
            await this.prisma.pMMember.update({
              where: { id: sanctionMbr.id },
              data: { role: 'MEMBER' },
            });
          else throw new WsException(userid + ' is banned from this channel');
          break;

        case 'ban':
          if (sanctionBan)
            await this.prisma.pMBanned.delete({
              where: { id: sanctionBan.id },
            });
          else
            throw new WsException(userid + ' is not banned from this channel');
          break;

        case 'kick':
          throw new WsException("You cannot 'unkick' a user");
      }
    } else if (sanctionBan && type === 'ban')
      await this.prisma.pMBanned.update({
        where: { id: sanctionBan.id },
        data: { time },
      });
    else {
      if (sanctionBan) throw new WsException(userid + ' is already banned');
      if (type === 'kick' || type === 'ban')
        await this.prisma.pMMember.delete({
          where: { id: sanctionMbr.id },
        });
      if (type === 'mute')
        await this.prisma.pMMember.update({
          where: { id: sanctionMbr.id },
          data: { role: 'MUTED', time },
        });
      else if (type === 'ban')
        await this.prisma.pMBanned.create({
          data: {
            userId: userid,
            chanId: channel.id,
            time,
          },
        });
    }
    if (add) {
      if (type === 'kick') time = undefined;
      const data: UserSanctionData = { id, type, time };
      this.emitToUser(userid, msgsToClient.userSanction, data);
    }
    return true;
  }

  async handleUnbanUnmute(): Promise<void> {
    // Handle unban
    const banned = await this.prisma.pMBanned.findMany({
      where: { time: { not: null } },
    });
    for (const ban of banned)
      if (new Date(ban.time).getTime() <= new Date().getTime())
        await this.prisma.pMBanned.delete({
          where: { id: ban.id },
        });

    // Handle unmute
    const muted = await this.prisma.pMMember.findMany({
      where: { AND: [{ role: 'MUTED' }, { time: { not: null } }] },
    });
    for (const mute of muted)
      if (new Date(mute.time).getTime() <= new Date().getTime())
        await this.prisma.pMMember.update({
          where: { id: mute.id },
          data: { role: 'MEMBER', time: null },
        });
  }

  /* UTILITY FUNCTIONS */
  private broadcast = (channel: string, event: string, data: object): boolean =>
    this.server.to(channel).emit(event, data);

  private emitToUser = (name: string, event: string, data: object): void => {
    // Emit a message to all connected clients of a user
    this.userMgr
      .getUser(name)
      ?.clients()
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

  private leaveGameRoom = async (clientId: string, tellOnline = true): True => {
    const client = this.clientMgr.getClient(clientId);
    // Make client leave
    await this.clientMgr.leaveGameRoom(clientId);
    const user = this.userMgr.getUser(client.userName);
    user.setGameRoom(null);
    user.setWatchRoom(null);
    if (tellOnline) this.tellUserIsOnline(client.userName);
    return true;
  };

  private tellUserIsOnline = (userName: string): void => {
    const data: UserStatusData = {
      id: userName,
      status: 'online',
    };
    this.broadcast(userName, msgsToClient.userStatus, data);
  };
}
