export const NetProtocol = {
  // Two-way (server <-> client)
  sendChallenge: 'sendChallenge',
  closeChallenge: 'closeChallenge',
  playerSit: 'playerSit',
  playerStand: 'playerStand',

  // Client-side only (server -> client)
  userOnline: 'userOnline',
  gameRoomCreated: 'gameRoomCreated',
  gameRoomInvitation: 'gameRoomInvitation',
  gameResults: 'gameResults',

  // Server-side only (client -> server)
  setUsername: 'setUsername',
  requestGameRooms: 'requestGameRooms',
  requestUsers: 'requestUsers',
  acceptChallenge: 'acceptChallenge',
  enterGameRoom: 'enterGameRoom',
  leaveGameRoom: 'leaveGameRoom',
};

export interface NetError {
  errorMsg: string;
  origin: {
    event: string;
    data: any;
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
  ball: {
    radius: number;
  };
  started: boolean;
  players: {
    name: string;
    hasController: boolean;
  }[];
  clientCanPlay: boolean;
}

export interface NetGameState {
  paddles: {
    topX: number;
  }[];
  ball: {
    centerX: number;
    centerY: number;
  };
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
