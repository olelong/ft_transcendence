export interface AvatarProps {
  id: string | undefined;
  userInfos: any;
  isMyProfilePage: boolean | undefined;
}

export interface ProfileProps {
  userInfosId: string | "";
  login: string | "";
  setIsMyFriend: any;
}