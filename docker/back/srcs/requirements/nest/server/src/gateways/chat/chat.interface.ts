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

export interface UserStatusData {
  users: { id: string; status: string }[];
}
