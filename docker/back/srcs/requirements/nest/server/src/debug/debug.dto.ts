import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class GameDto {
  @Length(2, 30)
  @Matches('^[\\w-]+$')
  winnerId: string;

  @Length(2, 30)
  @Matches('^[\\w-]+$')
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
  @Matches('^[\\w-]+$')
  id: string;
}
