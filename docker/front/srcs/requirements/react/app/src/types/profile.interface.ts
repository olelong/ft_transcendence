export interface AvatarProps {
  id: string | undefined;
  userInfos: any;
  isMyProfilePage: boolean | undefined;
}

export interface AddFriendProps {
  userInfosId: string | "";
  login: string | "";
  setIsMyFriend: any;
  isAddingFriend: boolean;
}

export interface CheckFriendProps {
  userInfosId: string | "";
  setIsMyFriend: any;
}
