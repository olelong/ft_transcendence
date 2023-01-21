export const NetProtocol = {
  // Two-way protocols
  setUsername: 'setUsername',
  requestGameRooms: 'requestGameRooms',
  requestUsers: 'requestUsers',
  sendChallenge: 'sendChallenge',
  closeChallenge: 'closeChallenge',
  acceptChallenge: 'acceptChallenge',
  leaveGameRoom: 'leaveGameRoom',

  // Send-only protocols (no handler)
  userOnline: 'userOnline',
  beingChallenged: 'beingChallenged',
  newGameRoom: 'newGameRoom',
};

export interface NetGameRoom {
  id: string;
  playerName1: string;
  playerName2: string;
}

export interface NetUser {
  name: string;
  gameRoomId?: string;
}

export interface NetError {
  errorMsg: string;
  origin: {
    event: string;
    data: any;
  };
}
