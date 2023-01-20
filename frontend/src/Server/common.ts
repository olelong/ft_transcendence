export interface Room {
  time: number,
  creator: string,
  opponent?: string,
}

export let CommProtocols = {
  setUsername: "setUsername",
  requestGameList: "requestGameList",
  requestUserList: "requestUserList",
}
