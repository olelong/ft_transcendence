import { NetGameRoom } from '../protocols';

interface Player {
  clientId?: string;
}

export class GameRoom {
  private players: Player[] = [null, null];
  private watcherIds = new Set<string>();

  constructor(
    public readonly playerName1: string,
    public readonly playerName2: string,
  ) {
    this.players[0] = { clientId: null };
    this.players[1] = { clientId: null };
  }

  obj(id: string): NetGameRoom {
    return {
      id: id,
      playerName1: this.playerName1,
      playerName2: this.playerName2,
    };
  }

  watchers = () => Array.from(this.watcherIds);

  setClient(id: string, playerName: string) {
    if (this.playerName1 === playerName) this.players[0].clientId = id;
    else this.players[1].clientId = id;
    return true;
  }
}
