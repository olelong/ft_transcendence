import { Injectable } from '@nestjs/common';
import { NetUser } from '../utils/protocols';

class User {
  private clientIds = new Set<string>();
  private challengeIds = new Set<string>();
  private playGameRoomId?: string = null;
  private watchGameRoomId?: string = null;

  constructor(firstClientId: string) {
    this.clientIds.add(firstClientId);
  }

  obj(name: string): NetUser {
    return {
      name: name,
      gameRoomId: this.playGameRoom() || this.watchGameRoom(),
    };
  }

  removeClient = (id: string): boolean => this.clientIds.delete(id);

  addClient = (id: string): boolean => {
    if (this.clientIds.has(id)) return false;
    this.clientIds.add(id);
    return true;
  };

  clients = (): string[] => Array.from(this.clientIds);

  numClients = (): number => this.clientIds.size;

  clearChallenges = (): void => this.challengeIds.clear();

  removeChallenge = (id: string): boolean => this.challengeIds.delete(id);

  addChallenge = (id: string): boolean => {
    if (this.challengeIds.has(id)) return false;
    this.challengeIds.add(id);
    return true;
  };

  challenges = (): string[] => Array.from(this.challengeIds);

  playGameRoom = (): string => this.playGameRoomId;

  setGameRoom = (id?: string): string => (this.playGameRoomId = id);

  watchGameRoom = (): string => this.watchGameRoomId;

  setWatchRoom = (id?: string): string => (this.watchGameRoomId = id);
}

@Injectable()
export default class UsersManager {
  private users = new Map<string, User>();

  getUsers = (): NetUser[] =>
    Array.from(this.users).map((v) => {
      const name = v[0];
      const user = v[1];
      return user.obj(name);
    });
  getUser = (name: string): User => this.users.get(name);

  newUser = (name: string, clientId: string): boolean => {
    const user = this.users.get(name);
    if (!user) {
      this.users.set(name, new User(clientId));
      return true;
    }
    user.addClient(clientId);
    return false;
  };

  removeUser = (name: string): boolean => this.users.delete(name);

  setClient = (name: string, clientId: string, add: boolean): number => {
    const user = this.users.get(name);
    if (add) user.addClient(clientId);
    else user.removeClient(clientId);
    return user.numClients();
  };

  setChallenge = (name: string, challengeId: string, add: boolean): boolean => {
    const user = this.users.get(name);
    return add
      ? user.addChallenge(challengeId)
      : user.removeChallenge(challengeId);
  };
}
