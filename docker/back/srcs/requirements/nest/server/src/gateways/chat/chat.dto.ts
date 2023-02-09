import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsBoolean,
  ValidateIf,
} from 'class-validator';

export const challengeActions = {
  send: 'send',
  accept: 'accept',
  close: 'close',
};
export class ChallengeDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(challengeActions))
  action: string;

  @IsString()
  @IsNotEmpty()
  opponentName: string;
}

export class GRAccessDto {
  @IsBoolean()
  join: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o) => o.join === true)
  @IsString()
  @IsNotEmpty()
  roomId?: string;
}
