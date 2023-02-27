export interface AvatarProps {
  id: string | undefined;
  userInfos: any; //retirer et mettre juste userInfosAvatar
  isMyProfilePage: boolean | undefined;
  isBlocked: boolean | undefined;
}

export interface ProfileInfosProps {
  login: string;
  setUserInfos: any;
  userInfos: any;
  isMyProfilePage: boolean | undefined;
  /*isBlocked: boolean | undefined;*/
  setIsBlocked: any;
}

export interface AddFriendProps {
  userInfosId: string | "";
  login: string | "";
  setIsMyFriend: any;
  isMyFriend: boolean;
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

export interface ProfileTabsProps {
  isBlocked: boolean | undefined;
  setIsBlocked: any;
  isMyProfilePage: boolean | undefined;
  userInfosGames: Games[];
  name: string;
}