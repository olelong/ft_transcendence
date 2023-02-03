interface Login {
  tfaRequired: boolean;
  newUser: boolean;
  token?: string;
}
export type LoginRes = Promise<Login>;

interface LoginTfa {
  token: string;
}
export type LoginTfaRes = Promise<LoginTfa>;

export type Achievement = {
  name: string;
  desc: string;
  img: string;
  score: number;
  goal: number;
};
type Stat = {
  wins: number;
  loses: number;
  rank: number;
};
export type Game = {
  id: string; // login of opponent
  myScore: number;
  enemyScore: number;
  timestamp: Date;
};
interface Profile {
  id: string;
  name: string;
  avatar: string;
  achievements: Achievement[];
  stats: Stat;
  games: Game[];
  theme?: string;
  tfa?: boolean;
}
export type ProfileRes = Promise<Profile>;

interface PutProfile {
  name?: boolean;
  tfa?: string;
  ok?: boolean;
}
export type PutProfileRes = Promise<PutProfile>;

interface ProfileTfa {
  valid: boolean;
}
export type ProfileTfaRes = Promise<ProfileTfa>;

type User = { id: string; name: string; avatar: string };
export type LeaderboardUser = User & { score: number };

interface Friends {
  friends: User[];
  pending: User[];
}
export type FriendsRes = Promise<Friends>;

interface Blocked {
  users: User[];
}
export type BlockedRes = Promise<Blocked>;

interface ok {
  ok: boolean;
}
export type okRes = Promise<ok>;
