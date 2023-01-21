import { Injectable } from '@nestjs/common';

class User {
  private clientIds = new Set<string>();
  private challengeIds = new Set<string>();
  private gameRoomId: string = null;

  constructor(firstClientId: string) {
    this.clientIds.add(firstClientId);
  }

  obj = (name: string) => {
    return {
      name: name,
      clientIds: this.clients(),
      challengeIds: this.challenges(),
      gameRoomId: this.gameRoom(),
    };
  };

  clients = () => Array.from(this.clientIds);
  challenges = () => Array.from(this.challengeIds);
  gameRoom = () => Array.from(this.gameRoomId);

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
    const existed = this.gameRoomId !== null;
    this.gameRoomId = null;
    return existed;
  };
  addGameRoom = (id: string) => {
    if (!this.gameRoomId) {
      this.gameRoomId = id;
      return true;
    }
    return false;
  };
}

@Injectable()
export class UserManager {
  private users = new Map<string, User>();

  getUser = (name: string) => this.users.get(name).obj(name);

  newUser = (name: string, clientId: string) => {
    if (this.users.has(name)) return false;
    const user = new User(clientId);
    this.users.set(name, user);
    return true;
  };

  setClient = (name: string, clientId: string, add: boolean) => {
    const user = this.users.get(name);
    if (!user) return false;
    return add ? user.addClient(clientId) : user.removeClient(clientId);
  };

  setChallenge = (name: string, challengeId: string, add: boolean) => {
    const user = this.users.get(name);
    if (!user) return false;
    return add
      ? user.addChallenge(challengeId)
      : user.removeChallenge(challengeId);
  };
}
