import { User } from '../user/user.interface';

interface CreateChan {
  chanid: number;
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

interface ok {
  ok: boolean;
}
export type okRes = Promise<ok>;
