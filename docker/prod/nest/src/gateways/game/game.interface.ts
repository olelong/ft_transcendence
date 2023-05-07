import ClientsManager from '../managers/clients-manager.service';
import GamesManager from '../managers/games-manager.service';
import UsersManager from '../managers/users-manager.service';
import Engine from '../utils/game-engine';

export interface UserInfos {
  id: string;
  name: string;
  avatar: string;
}

export interface InitData {
  config: typeof Engine.config;
  players: [UserInfos, UserInfos];
  state: NetGameState;
  idx?: number; // if client is player
}

export interface NetGameState {
  paddles: [number, number];
  ball: {
    x: number;
    y: number;
  };
  scores: [number, number];
  pauseMsg?: string; // appears if game is paused
  started: boolean;
  ended: boolean;
  watchers: number;
}

export type User = ReturnType<UsersManager['getUser']>;
export type GameRoom = ReturnType<GamesManager['getRoom']>;
export type Client = ReturnType<ClientsManager['getClient']>;
