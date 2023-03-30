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
  className?: string;
  placeholder?: string;
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
  members: SMember[];
  muted?: (SMember & { time?: Date })[];
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

interface MembersCategoryProps {
  category: keyof Members;
  children?: React.ReactNode;
}

interface ShowStatusProps {
  member: { status?: string; gameid?: string };
  dontShow? = false;
  styleOnOffline?: CSSProperties;
  styleInGame?: CSSProperties;
  classNameOnOffline?: string;
  classNameInGame?: string;
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
  myInfos: Member;
  recipientInfos: CurrConv;
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