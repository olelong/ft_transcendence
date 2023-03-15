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
declare module "js-cookie";
declare module "mdb-react-ui-kit";
declare module "react-switch";
declare module "react-select";

interface UserHeaderInfosProvider {
  id: string;
  name: string;
  avatar: string;
}

interface UserInfosProvider {
  id: string;
  name: string;
  avatar: string;
  achievements: [
    {
      title: string;
      description: string;
      badge: string;
      score: number;
      goal: number;
    }
  ];
  stats: {
    wins: number;
    loses: number;
    rank: number;
  };
  games: [
    {
      id: string;
      myScore: number;
      enemyScore: number;
      timestamp: Date;
    }
  ];
  theme: string;
  tfa: boolean;
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

interface ErrorRes {
  statusCode: number;
  error: string;
  message: string;
}
