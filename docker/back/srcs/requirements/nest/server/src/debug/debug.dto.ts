import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

import { userRegex } from '../user/user.dto';

export class GameDto {
  @Length(2, 30)
  @Matches(userRegex)
  winnerId: string;

  @Length(2, 30)
  @Matches(userRegex)
  loserId: string;
}

export class AchievementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  desc: string;
}

export class NewUserDto {
  @Length(2, 30)
  @Matches(userRegex)
  id: string;
}
