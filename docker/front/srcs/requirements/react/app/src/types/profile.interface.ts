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
  isBlocked: boolean | undefined;
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