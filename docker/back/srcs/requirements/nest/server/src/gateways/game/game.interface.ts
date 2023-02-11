import GamesManager from '../managers/games-manager.service';
import Engine from '../utils/game-engine';

export interface NetGameState {
  paddles: [number, number];
  ball: {
    x: number;
    y: number;
  };
  scores: [number, number];
  paused: boolean;
  ended: boolean;
  started: boolean;
}

export type GameRoom = ReturnType<GamesManager['getRoom']>;

export interface InitPongData {
  config: typeof Engine.config;
  players: [string, string];
  state: NetGameState;
  idx?: number; // if client is player
}

export interface GameEndedData {
  scores: [number, number];
  winner: string;
}
