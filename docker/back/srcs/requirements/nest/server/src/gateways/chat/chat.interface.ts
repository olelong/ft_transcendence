import { NetGameRoomSetup } from '../utils/protocols';

export const ChallengeDataInfos = {
  new: 'new',
  closed: 'closed',
  accepted: 'accepted',
};
export interface ChallengeData {
  info: string; // possible values defined above
  opponentName: string;
  // for 'accepted' case
  gameId?: string;
  gameRoomSetup?: NetGameRoomSetup;
}
