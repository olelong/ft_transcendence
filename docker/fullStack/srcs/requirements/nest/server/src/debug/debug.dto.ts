import { IsString, IsNotEmpty, Length, MaxLength } from 'class-validator';

export class GameDto {
  @Length(2, 30)
  winnerId: string;

  @Length(2, 30)
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
  id: string;
}
