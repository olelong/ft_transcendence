import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameManager } from '../Game/game';
import { UserManager } from '../User/user';

class Client {
  private watchGameRoomId?: string = null;

  constructor(
    public readonly socket: Socket,
    public readonly userName: string,
  ) {}

  gameRoom = () => this.watchGameRoomId;

  setGameRoom = (id?: string) => (this.watchGameRoomId = id);

  subscribe = (channel: string) => this.socket.join(channel);

  unsubscribe = (channel: string) => this.socket.leave(channel);
}

@Injectable()
export class ClientManager {
  private clients = new Map<string, Client>();

  constructor(
    private readonly userMgr: UserManager,
    private readonly gameMgr: GameManager,
  ) {}

  getClient = (id: string) => this.clients.get(id);

  newClient = (socket: Socket, userName: string) => {
    const client = new Client(socket, userName);
    this.clients.set(socket.id, client);
    return client;
  };

  removeClient = (id: string) => this.clients.delete(id);

  enterGameRoom = (clientId: string, roomId: string) => {
    const client = this.clients.get(clientId);
    this.gameMgr.getRoom(roomId).setWatcher(clientId, true);
    client.subscribe(roomId);
    client.setGameRoom(roomId);
    return this.canPlay(clientId);
  };

  leaveGameRoom = (clientId: string) => {
    const client = this.clients.get(clientId);
    this.gameMgr.getRoom(client.gameRoom()).setWatcher(clientId, false);
    client.unsubscribe(client.gameRoom());
    client.setGameRoom(null);
    return true;
  };

  canPlay = (clientId: string) => {
    const client = this.clients.get(clientId);
    const room = this.gameMgr.getRoom(client.gameRoom());
    const player = room.getPlayer(client.userName);
    // Return true if client's user is one of the players and the client
    // can take control of that player
    if (!player) return false;
    return !player.clientId();
  };
}
