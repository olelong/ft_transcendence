import GamesManager from '../managers/games-manager.service';
import UsersManager from '../managers/users-manager.service';
import Engine from '../utils/game-engine';

export interface NetGameState {
  paddles: [number, number];
  ball: {
    x: number;
    y: number;
  };
  scores: [number, number];
  pauseMsg?: string; // appears if game is paused
  ended: boolean;
  started: boolean;
}

export type User = ReturnType<UsersManager['getUser']>;
export type GameRoom = ReturnType<GamesManager['getRoom']>;

export interface InitPongData {
  config: typeof Engine.config;
  players: [string, string];
  state: NetGameState;
  idx?: number; // if client is player
}
