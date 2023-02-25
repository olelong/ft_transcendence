import { User } from '../user/user.interface';

interface CreateChan {
  chanid: number;
}
export type CreateChanRes = Promise<CreateChan>;

interface Channel {
  owner: string;
  admins: string[];
  muted: string[];
  members: User[];
  banned: User[];
}
export type ChannelRes = Promise<Channel>;
