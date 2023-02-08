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

export interface UserRoleData {
  userName: string;
  player: boolean;
}

export type Void = Promise<void>;
