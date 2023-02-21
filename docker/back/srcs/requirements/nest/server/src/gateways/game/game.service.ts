import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import ClientsManager from '../managers/clients-manager.service';
import GamesManager from '../managers/games-manager.service';
import UsersManager from '../managers/users-manager.service';
import PrismaService from '../../prisma/prisma.service';
import Engine from '../utils/game-engine';
import { NetError } from '../utils/protocols';
import { NetGameState, User, GameRoom, InitPongData } from './game.interface';

@Injectable()
export default class GameService {
  private readonly errorNotRegistered = 'You are not registered';
  server: Server;

  constructor(
    private readonly clientMgr: ClientsManager,
    private readonly userMgr: UsersManager,
    private readonly gameMgr: GamesManager,
    private prisma: PrismaService,
  ) {}

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
    const user = this.userMgr.getUser(socket.userId);
    if (!user) return error(this.errorNotRegistered);
    const isPlayer = user.playGameRoom() ? true : false;
    const gameRoom = isPlayer ? user.playGameRoom() : user.watchGameRoom();
    if (!gameRoom) return error('You are not in a game room');
    this.userMgr.setClient(socket.userId, socket.id, true);
    const client = this.clientMgr.newClient(socket, socket.userId);
    if (isPlayer) {
      client.setGameRoom(user.playGameRoom());
      if (this.clientMgr.canPlay(client.userName, client.gameRoom()))
        this.gameMgr.clientSit(socket.id, client.userName, user.playGameRoom());
    } else client.setGameRoom(gameRoom);
    await client.subscribe(client.gameRoom());
    const room = this.gameMgr.getRoom(client.gameRoom());
    if (!isPlayer) room.setWatcher(client, true);
    if (!room.engine.extState.started && isPlayer)
      room.engine.start(this.pauseGame, () => {
        void this.gameLoop(client.gameRoom());
      });
    const data: InitPongData = {
      config: Engine.config,
      players: this.playerNames(room),
      state: this.gameState(room),
      idx: isPlayer ? (room.player1.name === socket.userId ? 0 : 1) : undefined,
    };
    socket.emit('initPong', data);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const client = this.clientMgr.getClient(socket.id);
    if (!client) return;

    await client.unsubscribe(client.gameRoom());
    const room = this.gameMgr.getRoom(client.gameRoom());
    if (!room.getPlayer(client.userName)) room.setWatcher(client, false);
    const idx = this.playerIdx(socket, room);
    if (idx >= 0) this.playerQuit(idx, client.gameRoom());
    this.userMgr.setClient(client.userName, socket.id, false);
    this.clientMgr.removeClient(client.socket.id);
  }

  onPaddlePos(socket: Socket, pos: number): true {
    const roomId = this.clientMgr.getClient(socket.id).gameRoom();
    const room = this.gameMgr.getRoom(roomId);
    const idx = this.playerIdx(socket, room);
    if (idx === -1) throw new WsException("You're not the client player!");
    room.engine.extState.paddles[idx] = pos;
    this.server.to(roomId).emit('stateChanged', this.gameState(room));
    return true;
  }

  private playerIdx = (socket: Socket, room?: GameRoom): number => {
    if (!room) room = this.getRoom(socket);
    if (room.player1.clientId() === socket.id) return 0;
    if (room.player2.clientId() === socket.id) return 1;
    return -1;
  };

  private playerNames = (room: GameRoom): [string, string] => {
    return [room.player1.name, room.player2.name];
  };

  private gameState = (room: GameRoom): NetGameState => room.engine.extState;

  private gameLoop = async (roomId: string): Promise<void> => {
    const room = this.gameMgr.getRoom(roomId);
    room.engine.startRound();

    while (!room.engine.extState.ended) {
      if (room.engine.update())
        this.server.to(roomId).emit('stateChanged', this.gameState(room));
      await new Promise((f) => setTimeout(f, 10)); // sleep for 10 ms
    }
    await this.endOfGame(room);
  };

  private playerQuit = (idx: number, roomId: string): true => {
    const room = this.gameMgr.getRoom(roomId);
    const players = [room.player1, room.player2];
    players.forEach((player, i) => {
      if (!player.clientId()) return;
      if (idx === i) {
        const user = this.userMgr.getUser(player.name);
        const clients = user
          .clients()
          .map((client) => this.clientMgr.getClient(client))
          .filter((client) => client.gameRoom() === roomId);
        if (clients.length <= 1) player.setClientId(null);
        else player.setClientId(clients[1].socket.id);
      }
    });
    this.server.to(roomId).emit('playerQuit', idx);
    return true;
  };

  private pauseGame = (msg: string, roomId: string): void => {
    const room = this.gameMgr.getRoom(roomId);
    room.engine.extState.pauseMsg = msg;
    const data: NetGameState = this.gameState(room);
    data.pauseMsg = msg;
    this.server.to(roomId).emit('stateChanged', data);
  };

  private async endOfGame(room: GameRoom): Promise<void> {
    const state = this.gameState(room);
    this.server.to(room.id).emit('stateChanged', state);
    // Save game
    const winnerI = state.scores[0] > state.scores[1] ? 0 : 1;
    const playerIds = [room.player1.name, room.player2.name];
    try {
      await this.prisma.game.create({
        data: {
          time: new Date(),
          winnerId: playerIds[winnerI],
          loserId: playerIds[winnerI ^ 1],
          winnerScore: state.scores[winnerI],
          loserScore: state.scores[winnerI ^ 1],
        },
      });
    } catch (e) {
      console.error(e);
    }
    // Remove user if it has tp
    const users = new Map<string, User>();
    users.set(room.player1.name, this.userMgr.getUser(room.player1.name));
    users.set(room.player2.name, this.userMgr.getUser(room.player2.name));
    room
      .getWatchers()
      .forEach((client) =>
        users.set(client.userName, this.userMgr.getUser(client.userName)),
      );
    for (const [name, user] of users) {
      if (user.numClients() === 0 && user.hasToBeRemoved())
        this.userMgr.removeUser(name);
      else user.removeLater(false);
    }
    // Remove players from game room
    [...users.values()].forEach((user, i) => {
      user.setGameRoom(null);
      user.setWatchRoom(null);
      this.playerQuit(i, room.id);
    });
  }

  private getRoom(socket: Socket): GameRoom {
    const client = this.clientMgr.getClient(socket.id);
    const roomId = client.gameRoom();
    return this.gameMgr.getRoom(roomId);
  }
}
