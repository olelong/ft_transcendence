export interface NetError {
  errorMsg: string | string[];
  origin: {
    event: string;
    data: object;
  };
}

export interface NetGameRoom {
  id: string;
  playerName1: string;
  playerName2: string;
}

export interface NetUser {
  name: string;
  gameRoomId?: string;
}

export interface NetGameRoomSetup {
  canvas: {
    width: number;
    height: number;
  };
  paddle: {
    width: number;
    height: number;
  };
  ballRadius: number;
  players: {
    name: string;
    isHere: boolean;
  }[];
}

export interface NetGameState {
  paddles: number[];
  ball: {
    x: number;
    y: number;
  };
  scores: number[];
  paused: boolean;
  ended: boolean;
}

export interface NetGameResults {
  endedEarly: boolean;
  reason?: null;
  players: {
    name: string;
    score: number;
    resigned: boolean;
  }[];
}

export interface NetChallenge {
  id: string;
  timestamp: number;
  fromName: string;
  toName: string;
}
