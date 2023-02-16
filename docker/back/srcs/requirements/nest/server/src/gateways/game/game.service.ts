import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import ClientsManager from '../managers/clients-manager.service';
import GamesManager from '../managers/games-manager.service';
import UsersManager from '../managers/users-manager.service';
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
    const isWatcher = user
      .clients()
      .map((c) => this.clientMgr.getClient(c))
      .find((c) => c.gameRoom())
      ? true
      : false;
    if (!isPlayer && !isWatcher) return error('You are not in a game room');
    const client = this.clientMgr.newClient(socket, socket.userId);
    client.setGameRoom(user.playGameRoom());
    await client.subscribe(client.gameRoom());
    const room = this.gameMgr.getRoom(client.gameRoom());
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
    const idx = this.playerIdx(socket);
    if (idx >= 0) this.playerQuit(idx, client.gameRoom());
    this.clientMgr.removeClient(client.socket.id);
  }

  onPaddlePos(socket: Socket, pos: number): void {
    const roomId = this.clientMgr.getClient(socket.id).gameRoom();
    const room = this.gameMgr.getRoom(roomId);
    const idx = this.playerIdx(socket, room);
    if (idx >= 0) {
      room.engine.extState.paddles[idx] = pos;
      this.server.to(roomId).emit('stateChanged', this.gameState(room));
    }
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
    /// End of game ///
    this.server.to(roomId).emit('stateChanged', this.gameState(room));
    // Remove user if it has tp
    const users = new Map<string, User>();
    users.set(room.player1.name, this.userMgr.getUser(room.player1.name));
    users.set(room.player2.name, this.userMgr.getUser(room.player2.name));
    for (const [name, user] of users) {
      if (user.numClients() === 0 && user.hasToBeRemoved())
        this.userMgr.removeUser(name);
      else user.removeLater(false);
    }
    // Remove players from game room
    [...users.values()].forEach((user, i) => {
      user.setGameRoom(null);
      this.playerQuit(i, roomId);
    });
  };

  private playerQuit = (idx: number, roomId: string): true => {
    const room = this.gameMgr.getRoom(roomId);
    if (idx === 0) room.player1.setClientId(null);
    if (idx === 1) room.player2.setClientId(null);
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

  private getRoom(socket: Socket): GameRoom {
    const client = this.clientMgr.getClient(socket.id);
    const roomId = client.gameRoom();
    return this.gameMgr.getRoom(roomId);
  }
}
