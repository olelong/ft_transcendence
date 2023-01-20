import { Room } from "./common";

export interface Server {
  setUsername(name: string): void;
  requestGameList(): void;
  requestUserList(): void;
}
