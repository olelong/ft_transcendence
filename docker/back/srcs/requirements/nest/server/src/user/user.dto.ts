import { Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @MinLength(2)
  @MaxLength(30)
  @Matches('^[\\w-]+$')
  public id: string;
}
