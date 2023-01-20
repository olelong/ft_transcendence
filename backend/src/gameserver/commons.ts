export const NetProtocol = {
  // Two-way protocols
  setUsername: "setUsername",
  requestGameList: "requestGameList",
  requestUserList: "requestUserList",
  sendChallenge: "sendChallenge",
  closeChallenge: "closeChallenge",
  acceptChallenge: "acceptChallenge",
  leaveGameRoom: "leaveGameRoom",
  
  // Send-only protocols (no handler)
  userOnline: "userOnline",
  beingChallenged: "beingChallenged",
  newGameRoom: "newGameRoom",
}

export interface NetGame {
  id: string,
  name0: string,
  name1: string,
}

export interface NetUser {
  name: string,
  playingRoomId?: string
}

export interface NetError {
  errorMsg: string,
  origin: {
    event: string,
    data: any
  }
}
