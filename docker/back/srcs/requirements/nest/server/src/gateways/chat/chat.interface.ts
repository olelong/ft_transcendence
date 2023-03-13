export type True = Promise<true>;

export const ChallengeDataInfos = {
  new: 'new',
  closed: 'closed',
  accepted: 'accepted',
};
export interface ChallengeData {
  info: string; // possible values defined above
  opponentName: string;
  gameId?: string; // for 'accepted' case
}

export interface MatchmakingData {
  opponentName: string;
  gameId: string;
}

export interface ChannelMsgData {
  id: number;
  msgid: number;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  time: Date;
}

export interface UserMsgData {
  msgid: number;
  senderid: string;
  content: string;
  time: Date;
}

export interface UserStatusData {
  id: string;
  status: string;
  gameid?: string;
}

export interface UserSanctionData {
  id: number;
  type: string;
  time?: Date;
}
