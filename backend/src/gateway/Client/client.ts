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

  removeClient = (id: string) => this.clients.delete(id);

  setGameRoom = (id: string, roomId?: string) => {
    const client = this.clients.get(id);
    if (!roomId) {
      // Client exit game room
      client.socket.leave(client.gameRoom());
      return client.removeGameRoom();
    }
    // Client joins game room
    client.socket.join(roomId);
    return client.addGameRoom(roomId);
  };

  setSubscription = (id: string, channel: string, add: boolean) => {
    const socket = this.clients.get(id).socket;
    const exist = socket.rooms.has(channel);
    if (add === exist) return false;
    if (add) socket.join(channel);
    else socket.leave(channel);
    return true;
  };
}
