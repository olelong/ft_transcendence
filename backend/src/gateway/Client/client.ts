import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

class Client {
  private watchGameRoomId?: string = null;

  constructor(
    public readonly socket: Socket,
    public readonly userName: string,
  ) {}

  gameRoom = () => this.watchGameRoomId;

  removeGameRoom = () => {
    const existed = this.watchGameRoomId !== null;
    this.watchGameRoomId = null;
    return existed;
  };
  addGameRoom = (id: string) => {
    if (!this.watchGameRoomId) {
      this.watchGameRoomId = id;
      return true;
    }
    return false;
  };
}

@Injectable()
export class ClientManager {
  private clients = new Map<string, Client>();

  getClient = (id: string) => this.clients.get(id);

  newClient = (socket: Socket, userName: string) => {
    this.clients.set(socket.id, new Client(socket, userName));
  };

  setGameRoom = (id: string, roomId?: string) => {
    const client = this.clients.get(id);
    if (!client) return false;
    if (!roomId) return client.removeGameRoom();
    return client.addGameRoom(roomId);
  };
}
