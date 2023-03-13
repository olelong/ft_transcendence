declare module "*.png" {
  const value: any;
  export = value;
}
declare module "*.jpg" {
  const value: any;
  export = value;
}
declare module "*.gif" {
  const value: any;
  export = value;
}
declare module "*.bmp" {
  const value: any;
  export = value;
}
declare module "react-router-bootstrap";

interface UserInfosProvider {
  id: string;
  avatar: string;
}

interface GameState {
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

interface NetError {
  errorMsg: string | string[];
  origin: {
    event: string;
    data: object;
  };
}

interface Channel {
  id: number;
  name: string;
  avatar: string;
  protected: boolean;
}

interface SearchBarProps {
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
