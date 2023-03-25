import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsBoolean,
  ValidateIf,
  IsArray,
  IsNumber,
  MaxLength,
  IsOptional,
  IsDateString,
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

export class MatchmakingDto {
  @IsBoolean()
  join: boolean;
}

export class ChannelMsgDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content: string;
}

export class UserMsgDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content: string;
}

export class UserStatusDto {
  @IsArray()
  @IsString({ each: true })
  users: string[];
}

export class UserSanctionDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  userid: string;

  @IsIn(['mute', 'kick', 'ban'])
  type: string;

  @IsBoolean()
  add: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o) => o.type === 'mute' || o.type === 'ban')
  @IsOptional()
  @IsDateString()
  time?: Date;
}
