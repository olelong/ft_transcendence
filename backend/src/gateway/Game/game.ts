import { Injectable } from '@nestjs/common';
import { UserManager } from '../User/user';
import { Challenge } from './challenge';
import { GameRoom } from './room';

const idPrefix = {
  gameRoom: 'g_',
  challenge: 'c_',
};

@Injectable()
export class GameManager {
  constructor(private readonly userMgr: UserManager) {}

  private rooms = new Map<string, GameRoom>();
  private challenges = new Map<string, Challenge>();

  getRooms = () =>
    Array.from(this.rooms).map((v) => {
      const id = v[0];
      const room = v[1];
      return room.obj(id);
    });

  getRoom = (id: string) => {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    return room.obj(id);
  };

  userEnterRoom(userName: string, roomId: string) {
    const user = this.userMgr.getUser(userName);
    const room = this.rooms.get(roomId);

    if (
      [room.playerName1, room.playerName2].includes(userName) &&
      !user.playGameRoom()
    ) {
      // enter as player
      room.setClient();
    }
  }

  getChallenges = () =>
    Array.from(this.challenges).map((v) => {
      const id = v[0];
      const challenge = v[1];
      return challenge.obj(id);
    });

  getChallenge = (userName1: string, userName2: string) =>
    this.challenges.get(this.getChallengeId(userName1, userName2));

  challengeExists = (userName1: string, userName2: string) =>
    this.getChallenge(userName1, userName2) !== null;

  newChallenge = (fromName: string, toName: string) => {
    const id = this.getChallengeId(fromName, toName);
    this.challenges.set(id, new Challenge(fromName, toName));
    return id;
  };

  private getChallengeId = (name1: string, name2: string) =>
    name1.localeCompare(name2) < 0
      ? idPrefix.challenge + `${name1} ${name2}`
      : idPrefix.challenge + `${name2} ${name1}`;
}
