import { NetGameRoomSetup } from '../utils/protocols';

export const ChallengeDataInfos = {
  new: 'new',
  closed: 'closed',
  accepted: 'accepted',
};
export interface ChallengeData {
  info: string; // possible values defined above
  opponentName: string;
  gameId?: string; // for 'accepted' case
  gameRoomSetup?: NetGameRoomSetup; // for 'accepted' case
}

export interface WatcherUpdateData {
  userName: string;
  enters: boolean;
}
