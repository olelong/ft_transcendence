import { NetGameRoom } from '../protocols';

class Player {
  private client?: string = null;

  constructor(public readonly name: string) {}

  clientId = () => this.client;

  setClientId = (id?: string) => (this.client = id);
}

export class GameRoom {
  private watcherIds = new Set<string>();
  readonly player1: Player;
  readonly player2: Player;

  constructor(playerName1: string, playerName2: string) {
    this.player1 = new Player(playerName1);
    this.player2 = new Player(playerName2);
  }

  obj(id: string): NetGameRoom {
    return {
      id: id,
      playerName1: this.player1.name,
      playerName2: this.player2.name,
    };
  }

  watchers = () => Array.from(this.watcherIds);

  setWatcher = (clientId: string, add: boolean) => {
    if (!add) return this.watcherIds.delete(clientId);
    this.watcherIds.add(clientId);
    return true;
  };

  getPlayer = (name: string) => {
    if (this.player1.name === name) return this.player1;
    if (this.player2.name === name) return this.player2;
    return undefined;
  };

  setPlayerClient = (playerName: string, clientId?: string) => {
    if (this.player1.name === playerName) this.player1.setClientId(clientId);
    else if (this.player2.name === playerName)
      this.player2.setClientId(clientId);
  };
}
