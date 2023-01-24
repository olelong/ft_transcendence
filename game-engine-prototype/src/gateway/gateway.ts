import { Socket, Server } from 'socket.io';
import {
  OnGatewayDisconnect,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Engine } from './engine';
import { SchedulerRegistry, Timeout } from '@nestjs/schedule';

interface Player {
  name: string;
  client: Socket;
  ready: boolean;
}

@WebSocketGateway({
  // cors: { origin: ['localhost:3000'] },
  // transports: ['websocket'],
  namespace: 'in-game',
})
export class GameEngineGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  readonly gameChannel = 'game';
  readonly engine: Engine;
  players: Player[] = [null, null];

  @WebSocketServer() private server: Server;

  constructor(private readonly scheduler: SchedulerRegistry) {
    this.engine = new Engine(10, this.startRound, this.endRound);
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

  handleConnection(socket: Socket) {
    socket.join(this.gameChannel);
    socket.emit('initPong', {
      config: Engine.config,
      players: this.playerNames(),
      state: this.gameState(),
    });
  }

  handleDisconnect(socket: Socket) {
    socket.leave(this.gameChannel);
    const idx = this.playerIdx(socket);
    if (idx >= 0) this.playerQuit(idx);
  }

  @SubscribeMessage('playerJoin')
  onPlayerJoin(socket: Socket, name: string) {
    if (!this.players[0]) return this.playerJoin(0, name, socket);
    else if (!this.players[1]) return this.playerJoin(1, name, socket);
    return false;
  }

  @SubscribeMessage('playerReady')
  onPlayerReady(socket: Socket) {
    const idx = this.playerIdx(socket);
    if (idx >= 0 && this.playerReady(idx)) {
      // User pause game to count down 3 seconds
      this.pauseGame('3');
      this.scheduler.addTimeout(
        'two_TO',
        setTimeout(() => this.pauseGame('2'), 1000),
      );
      this.scheduler.addTimeout(
        'one_TO',
        setTimeout(() => this.pauseGame('1'), 2000),
      );
      // this.scheduler.addTimeout(
      //   'zero_TO',
      //   setTimeout(() => this.gameLoop(), 3000),
      // );
    }
  }

  private playerIdx = (socket: Socket) =>
    this.players.findIndex((p) => p !== null && p.client === socket);

  private playerNames = () =>
    this.players.map((p) => (p === null ? null : p.name));

  private gameState = () => this.engine.extState;

  private gameLoop = () => {};

  private startRound = () => {};

  private endRound = () => {};

  private playerJoin = (idx: number, name: string, socket: Socket) => {
    this.players[idx] = { name: name, client: socket, ready: false };
    this.server
      .to(this.gameChannel)
      .emit('playerJoin', { name: name, pos: idx });
    return true;
  };

  private playerQuit = (idx: number) => {
    if (!this.gameState().paused)
      this.pauseGame(
        `Player ${this.players[idx].name} just quitted. Waiting...`,
      );
    this.players[idx] = null;
    this.server.to(this.gameChannel).emit('playerQuit', idx);
    return true;
  };

  private playerReady = (idx: number) => {
    this.players[idx].ready = true;
    this.server.to(this.gameChannel).emit('playerReady', idx);
    const other = this.players[idx == 0 ? 1 : 0];
    return other !== null && other.ready;
  };

  private pauseGame = (msg: string) => {
    this.engine.extState.paused = true;
    this.server.to(this.gameChannel).emit('pause', msg);
  };
}
