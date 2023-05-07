import { Injectable } from '@nestjs/common';

import UsersManager from './users-manager.service';
import Engine from '../utils/game-engine';
import { NetChallenge, NetGameRoom } from '../utils/protocols';
import { Client } from '../game/game.interface';
import { UserStatusEvData } from '../chat/chat.interface';

const idPrefix = {
  room: 'g_',
  challenge: 'c_',
};

class Challenge {
  public readonly timestamp: number;

  constructor(
    public readonly fromName: string,
    public readonly toName: string,
  ) {
    this.timestamp = Date.now();
  }

  obj = (id: string): NetChallenge => ({
    id: id,
    timestamp: this.timestamp,
    fromName: this.fromName,
    toName: this.toName,
  });
}

class Player {
  private client?: string = null;

  constructor(public readonly name: string) {}

  clientId = (): string => this.client;

  setClientId = (id?: string): string => (this.client = id);
}

class GameRoom {
  private watchers = new Set<Client>();
  engine = new Engine(11, this.id);
  readonly player1: Player;
  readonly player2: Player;

  constructor(
    playerName1: string,
    playerName2: string,
    public readonly id: string,
  ) {
    this.player1 = new Player(playerName1);
    this.player2 = new Player(playerName2);
  }

  obj(id: string): NetGameRoom {
    return {
      id: id,
      playerName1: this.player1.name,
      playerName2: this.player2.name,
    };
  }

  getWatchers = (): Client[] => Array.from(this.watchers);

  setWatcher = (client: Client, add: boolean): boolean => {
    let ret = true;
    if (add) this.watchers.add(client);
    else ret = this.watchers.delete(client);
    this.engine.extState.watchers = Array.from(this.watchers).reduce(
      (acc: string[], client) => {
        if (!acc.find((userName) => userName === client.userName))
          acc.push(client.userName);
        return acc;
      },
      [],
    ).length;
    return ret;
  };

  getPlayer = (name: string): Player => {
    if (this.player1.name === name) return this.player1;
    if (this.player2.name === name) return this.player2;
    return undefined;
  };
}

@Injectable()
export default class GamesManager {
  constructor(private readonly userMgr: UsersManager) {}

  private rooms = new Map<string, GameRoom>();
  private challenges = new Map<string, Challenge>();

  getRooms = (): NetGameRoom[] =>
    Array.from(this.rooms).map((v) => {
      const id = v[0];
      const room = v[1];
      return room.obj(id);
    });

  getRoom = (id: string): GameRoom => this.rooms.get(id);

  canCreateRoom = (playerName1: string, playerName2: string): boolean => {
    const user1 = this.userMgr.getUser(playerName1);
    const user2 = this.userMgr.getUser(playerName2);
    if (user1.playGameRoom() || user2.playGameRoom()) return false;
    return true;
  };

  newRoom = (playerName1: string, playerName2: string): string => {
    const roomId = this.getRoomId(playerName1, playerName2);
    this.rooms.set(roomId, new GameRoom(playerName1, playerName2, roomId));
    return roomId;
  };

  getRoomId = (name1: string, name2: string): string =>
    name1.localeCompare(name2) < 0
      ? idPrefix.room + `${name1}_${name2}`
      : idPrefix.room + `${name2}_${name1}`;

  getChallenges = (): NetChallenge[] =>
    Array.from(this.challenges).map((v) => {
      const id = v[0];
      const challenge = v[1];
      return challenge.obj(id);
    });

  getChallenge = (userName1: string, userName2: string): Challenge =>
    this.challenges.get(this.getChallengeId(userName1, userName2));

  getChallengeById = (id: string): Challenge => this.challenges.get(id);

  getChallengeId = (name1: string, name2: string): string =>
    name1.localeCompare(name2) < 0
      ? idPrefix.challenge + `${name1}_${name2}`
      : idPrefix.challenge + `${name2}_${name1}`;

  challengeExists = (userName1: string, userName2: string): boolean =>
    this.getChallenge(userName1, userName2) !== undefined;

  newChallenge = (fromName: string, toName: string): string => {
    const id = this.getChallengeId(fromName, toName);
    this.challenges.set(id, new Challenge(fromName, toName));
    return id;
  };

  removeChallenge = (userName1: string, userName2: string): true => {
    const id = this.getChallengeId(userName1, userName2);
    this.userMgr.getUser(userName1).removeChallenge(id);
    this.userMgr.getUser(userName2).removeChallenge(id);
    this.challenges.delete(id);
    return true;
  };

  closeChallengesByUser = (userName: string): boolean => {
    const user = this.userMgr.getUser(userName);
    user.challenges().forEach((id) => {
      this.challenges.delete(id);
    });
    user.clearChallenges();
    return true;
  };

  userSit = (name: string, roomId: string): boolean => {
    const user = this.userMgr.getUser(name);
    user.setGameRoom(roomId);
    return true;
  };

  clientSit = (clientId: string, userName: string, roomId: string): boolean => {
    const room = this.rooms.get(roomId);
    const player = room.getPlayer(userName);
    player.setClientId(clientId);
    return true;
  };

  // So gameService can send user status to corresponding chat rooms
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  sendStatus = (name: string, data: UserStatusEvData): void => {};
}
