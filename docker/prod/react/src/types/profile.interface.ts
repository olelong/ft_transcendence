export interface AvatarProps {
  id: string | undefined;
  userInfos: any;
  isMyProfilePage?: boolean | undefined;
  isBlocked: boolean | undefined;
}

export interface ProfileInfosProps {
  login: string;
  setUserInfos: any;
  userInfos: any;
  isMyProfilePage: boolean | undefined;
  setIsBlocked: any;
}

export interface AddFriendProps {
  userInfosId: string | "";
  login: string | "";
  setIsMyFriend: any;
  isMyFriend: boolean;
}

export interface InviteFriendProps {
  userInfosId: string | "";
  login: string | "";
  setInvitationSent: any;
  invitationSent: boolean;
}

export interface CheckFriendProps {
  userInfosId: string | "";
  setIsMyFriend: any;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Games {
  name: string;
  myScore: number;
  enemyScore: number;
  timestamp: Date;
}

export interface AchievementsProps {
  name: string;
  desc: string;
  img: string;
  score: number;
  goal: number;
}

export interface Stats { 
  wins: number;
  loses: number;
  rank: number;
}

export interface ProfileTabsProps {
  isBlocked: boolean | undefined;
  setIsBlocked: any;
  isMyProfilePage: boolean | undefined;
  userInfosGames: Games[];
  name: string;
  userInfosAchievements: AchievementsProps[];
  userInfosStats: Stats;
}