import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import GamesManager from './games-manager.service';

class Client {
  private watchGameRoomId?: string = null;

  constructor(
    public readonly socket: Socket,
    public readonly userName: string,
  ) {}

  gameRoom = (): string => this.watchGameRoomId;

  setGameRoom = (id?: string): string => (this.watchGameRoomId = id);

  subscribe = async (channel: string): Promise<void> =>
    await this.socket.join(channel);

  unsubscribe = async (channel: string): Promise<void> =>
    await this.socket.leave(channel);
}

@Injectable()
export default class ClientsManager {
  private clients = new Map<string, Client>();

  constructor(private readonly gameMgr: GamesManager) {}

  getClient = (id: string): Client => this.clients.get(id);

  newClient = (socket: Socket, userName: string): Client => {
    const client = new Client(socket, userName);
    this.clients.set(socket.id, client);
    return client;
  };

  removeClient = (id: string): boolean => this.clients.delete(id);

  enterGameRoom = async (
    clientId: string,
    roomId: string,
  ): Promise<boolean> => {
    const client = this.clients.get(clientId);
    await client.subscribe(roomId);
    //client.setGameRoom(roomId);
    return this.canPlay(client.userName, roomId);
  };

  leaveGameRoom = async (clientId: string): Promise<boolean> => {
    const client = this.clients.get(clientId);
    await client.unsubscribe(client.gameRoom());
    //client.setGameRoom(null);
    return true;
  };

  canPlay = (userName: string, roomId: string): boolean => {
    const room = this.gameMgr.getRoom(roomId);
    const player = room.getPlayer(userName);
    // Return true if client's user is one of the players and the client
    // can take control of that player
    if (!player) return false;
    return !player.clientId();
  };
}
