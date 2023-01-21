import { Injectable } from '@nestjs/common';
import { NetUser } from '../protocols';

class User {
  private clientIds = new Set<string>();
  private challengeIds = new Set<string>();
  private playGameRoomId?: string = null;

  constructor(firstClientId: string) {
    this.clientIds.add(firstClientId);
  }

  obj(name: string): NetUser {
    return {
      name: name,
      gameRoomId: this.playGameRoom(),
    };
  }

  clients = () => Array.from(this.clientIds);

  challenges = () => Array.from(this.challengeIds);

  playGameRoom = () => this.playGameRoomId;

  removeClient = (id: string) => this.clientIds.delete(id);

  addClient = (id: string) => {
    if (this.clientIds.has(id)) return false;
    this.clientIds.add(id);
    return true;
  };

  removeChallenge = (id: string) => this.challengeIds.delete(id);

  addChallenge = (id: string) => {
    if (this.challengeIds.has(id)) return false;
    this.challengeIds.add(id);
    return true;
  };

  removeGameRoom = () => {
    const existed = this.playGameRoomId !== null;
    this.playGameRoomId = null;
    return existed;
  };
  addGameRoom = (id: string) => {
    if (!this.playGameRoomId) {
      this.playGameRoomId = id;
      return true;
    }
    return false;
  };
}

@Injectable()
export class UserManager {
  private users = new Map<string, User>();

  getUsers = () =>
    Array.from(this.users).map((v) => {
      const name = v[0];
      const user = v[1];
      return user.obj(name);
    });
  getUser = (name: string) => this.users.get(name);

  newUser = (name: string, clientId: string) => {
    if (this.users.has(name)) return false;
    const user = new User(clientId);
    this.users.set(name, user);
    return true;
  };

  removeUser = (name: string) => this.users.delete(name);

  setClient = (name: string, clientId: string, add: boolean) => {
    const user = this.users.get(name);
    return add ? user.addClient(clientId) : user.removeClient(clientId);
  };

  setChallenge = (name: string, challengeId: string, add: boolean) => {
    const user = this.users.get(name);
    return add
      ? user.addChallenge(challengeId)
      : user.removeChallenge(challengeId);
  };

  setGameRoom = (name: string, roomId?: string) => {
    const user = this.users.get(name);
    if (!roomId) return user.removeGameRoom();
    return user.addGameRoom(roomId);
  };
}
