import { User } from '../user/user.interface';

interface ok {
  ok: boolean;
}
export type okRes = Promise<ok>;

interface CreateChan {
  id: number;
}
export type CreateChanRes = Promise<CreateChan>;

interface Channel {
  owner: string;
  admins: string[];
  muted?: { id: string; time?: Date }[];
  members: User[];
  banned?: (User & { time?: Date })[];
}
export type ChannelRes = Promise<Channel>;

interface ChannelInfo {
  id: number;
  name: string;
  avatar: string;
}
interface AllChannels {
  channels: (ChannelInfo & { protected: boolean })[];
}
export type AllChannelsRes = Promise<AllChannels>;

interface UserChannels {
  channels: ChannelInfo[];
}
export type UserChannelsRes = Promise<UserChannels>;

interface Role {
  role: string; // member/admin/owner/muted/banned
  time?: Date; // for muted or banned
}
export type RoleRes = Promise<Role>;

interface ChannelMsg {
  messages: {
    id: number;
    sender: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    time: Date;
  }[];
}
export type ChannelMsgRes = Promise<ChannelMsg>;

interface UserMsg {
  messages: {
    id: number;
    senderid: string;
    content: string;
    time: Date;
  }[];
}
export type UserMsgRes = Promise<UserMsg>;
