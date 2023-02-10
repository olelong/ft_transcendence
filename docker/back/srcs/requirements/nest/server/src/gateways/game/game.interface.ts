import GamesManager from '../games-manager.service';

export interface NetGameState {
  paddles: number[];
  ball: {
    x: number;
    y: number;
  };
  scores: number[];
  paused: boolean;
  ended: boolean;
  started: boolean;
}

export type GameRoom = ReturnType<GamesManager['getRoom']>;
