export interface AvatarProps {
  id: string | undefined;
  userInfos: any;
  isMyProfilePage: boolean | undefined;
  isBlocked: boolean | undefined;
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
