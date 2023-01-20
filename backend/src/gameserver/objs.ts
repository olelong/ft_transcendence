import { Socket } from "socket.io";


export interface User {
  name: string,
  clientIds: Set<string>,
  openChallenges: Set<string>,
  playingRoomId?: string,

}

export interface Client {
  socket: Socket,
  userName: string,
  watchingRoomId?: string,
}

export interface Player {
  name: string,
  clientId?: string,
}

export interface GameRoom {
  id: string,
  player0: Player,
  player1: Player,
  watchers: Set<string> // id of clients watching game
}

export interface Challenge {
  id: string,
  timestamp: number,
  initiator: string,   // username of challenger
}
