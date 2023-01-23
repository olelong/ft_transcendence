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

  removeClient = (id: string) => this.clientIds.delete(id);

  addClient = (id: string) => {
    if (this.clientIds.has(id)) return false;
    this.clientIds.add(id);
    return true;
  };

  clients = () => Array.from(this.clientIds);

  numClients = () => this.clientIds.size;

  clearChallenges = () => this.challengeIds.clear();

  removeChallenge = (id: string) => this.challengeIds.delete(id);

  addChallenge = (id: string) => {
    if (this.challengeIds.has(id)) return false;
    this.challengeIds.add(id);
    return true;
  };

  challenges = () => Array.from(this.challengeIds);

  playGameRoom = () => this.playGameRoomId;

  setGameRoom = (id?: string) => (this.playGameRoomId = id);
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
    const user = this.users.get(name);
    if (!user) {
      this.users.set(name, new User(clientId));
      return true;
    }
    user.addClient(clientId);
    return false;
  };

  removeUser = (name: string) => this.users.delete(name);

  setClient = (name: string, clientId: string, add: boolean) => {
    const user = this.users.get(name);
    if (add) user.addClient(clientId);
    else user.removeClient(clientId);
    return user.numClients();
  };

  setChallenge = (name: string, challengeId: string, add: boolean) => {
    const user = this.users.get(name);
    return add
      ? user.addChallenge(challengeId)
      : user.removeChallenge(challengeId);
  };
}
