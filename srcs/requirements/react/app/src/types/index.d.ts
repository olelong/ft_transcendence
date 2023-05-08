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

interface User {
  id: string;
  name: string;
  avatar: string;
}
type UserSocket = User & {
  status?: "online" | "offline" | "ingame";
  gameid?: string;
};

interface UserProfile {
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

interface Channel {
  id: number;
  name: string;
  avatar: string;
  protected: boolean;
}

interface ChannelLeft {
  id: number | undefined;
  name: string;
  avatar: string;
  private: boolean;
  role?: "member" | "owner" | "admin" | "banned" | "muted";
  dropdownOpen: boolean;
}

interface SearchBarProps {
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
}

interface ErrorRes {
  statusCode: number;
  error: string;
  message: string;
}

interface MembersData {
  owner: string;
  admins: string[];
  muted?: { id: string; time?: Date }[];
  members: User[];
  banned?: (User & { time?: Date })[];
}
interface Members {
  owner: UserSocket;
  admins: UserSocket[];
  members: UserSocket[];
  muted?: (UserSocket & { time?: Date })[];
  banned?: (UserSocket & { time?: Date })[];
}

interface UserStatusEvData {
  id: string;
  status: "online" | "offline" | "ingame";
  gameid?: string;
}

interface LoginTfaProps {
  tfaValid: boolean | null;
  setTfaValid: React.Dispatch<React.SetStateAction<boolean | null>>;
  loginWithTfa: (tfaCode: string) => void;
}

interface MembersCategoryProps {
  category: keyof Members;
  children?: React.ReactNode;
}

interface ShowStatusProps {
  user: { status?: string; gameid?: string };
  dontShow? = false;
  styleOnOffline?: CSSProperties;
  styleInGame?: CSSProperties;
  classNameOnOffline?: string;
  classNameInGame?: string;
  classNameTooltip?: string;
}

interface SanctionTimeProps {
  sanctionned: { id: string; time?: Date }[] | undefined;
  setMembers?: React.Dispatch<React.SetStateAction<Members | undefined>>;
  setTimeLeft?:
    | React.Dispatch<React.SetStateAction<string | undefined>>
    | ((timeLeft: string | undefined) => void);
}

interface OwnerModalProps {
  infos: {
    show: boolean;
    id: string;
    name: string;
  };
  close: () => void;
  setOwner: () => void;
}

interface SanctionModalProps {
  infos: {
    show: boolean;
    id: string;
    name: string;
  };
  close: () => void;
  sanction: (
    sanction: "kick" | "mute" | "ban",
    time?: { days: number; hours: number; minutes: number }
  ) => void;
}

interface BaseMessage {
  id: number; // message's id
  content: string;
  time: Date;
  sent? = true;
}

interface ChannelMessage extends BaseMessage {
  chanid: number;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  senderid?: never;
}

interface UserMessage extends BaseMessage {
  sender?: never;
  senderid: string;
}

type Message = ChannelMessage | UserMessage;

interface MessageProps {
  message: Message;
  myInfos: UserInfos;
  recipientInfos: CurrConv;
}

interface NetError {
  errorMsg: string | string[];
  origin: {
    event: string;
    data: object;
  };
}

interface UserSanctionEvData {
  id: number;
  type: "mute" | "kick" | "ban";
  time?: Date;
}

interface ChallengeEvData {
  info: "new" | "accepted" | "closed";
  opponentName: string;
  gameId: string;
}

interface MatchmakingEvData {
  opponentName: string;
  gameId: string;
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

interface GameInitEvData {
  config: {
    canvas: {
      width: number;
      height: number;
    };
    paddle: {
      width: number;
      height: number;
    };
    ballRadius: number;
  };
  players: [User, User];
  state: GameState;
  idx?: number; // if client is player
}

interface ThemeImages {
  paddle: string;
  ball: string;
  map: string;
}
