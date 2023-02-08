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
  opponentName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(challengeActions))
  action: string;
}

export class GRAccessDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o) => o.enter === true)
  @IsString()
  @IsNotEmpty()
  roomId?: string;

  @IsBoolean()
  enter: boolean;
}

export class GRRoleDto {
  @IsBoolean()
  player: boolean;
}
