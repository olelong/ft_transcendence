import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateChanDto {
  @Length(2, 30)
  @Matches('^[\\w -]+$')
  name: string;

  @IsString()
  @IsNotEmpty()
  avatar: string;

  @IsIn(['public', 'protected', 'private'])
  type: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o) => o.type === 'protected')
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password?: string;
}
