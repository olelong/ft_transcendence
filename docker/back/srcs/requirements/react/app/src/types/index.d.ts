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

interface ErrorRes {
  statusCode: number;
  error: string;
  message: string;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
}
interface MembersData {
  owner: string;
  admins: string[];
  muted?: { id: string; time?: Date }[];
  members: Member[];
  banned?: (Member & { time?: Date })[];
}
type SMember = Member & {
  status?: "online" | "offline" | "ingame";
  gameid?: string;
};
interface Members {
  owner: SMember;
  admins: SMember[];
  muted?: (SMember & { time?: Date })[];
  members: SMember[];
  banned?: (SMember & { time?: Date })[];
}

interface UserStatusData {
  id: string;
  status: "online" | "offline" | "ingame";
  gameid?: string;
}

interface LoginTfaProps {
  tfaValid: boolean | null;
  setTfaValid: React.Dispatch<React.SetStateAction<boolean | null>>;
  loginWithTfa: (tfaCode: string) => void;
}
