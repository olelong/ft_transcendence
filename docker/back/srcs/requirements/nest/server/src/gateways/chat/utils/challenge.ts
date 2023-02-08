import { NetChallenge } from '../../utils/protocols';

export default class Challenge {
  public readonly timestamp: number;

  constructor(
    public readonly fromName: string,
    public readonly toName: string,
  ) {
    this.timestamp = Date.now();
  }

  obj = (id: string): NetChallenge => ({
    id: id,
    timestamp: this.timestamp,
    fromName: this.fromName,
    toName: this.toName,
  });
}
