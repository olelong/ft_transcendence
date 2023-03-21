import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  Length,
  Matches,
  IsDecimal,
  IsStrongPassword,
} from 'class-validator';

export const userRegex = '^\\$?[\\w-]+$';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}

export class LoginTfaDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsString()
  @Length(6, 6, { message: 'code must be 6 characters long' })
  tfa: string;
}

export class CSignUpDto {
  @Length(2, 30)
  @Matches(userRegex)
  login: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}

export class CLoginDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CLoginTfaDto extends CLoginDto {
  @IsString()
  @Length(6, 6, { message: 'code must be 6 characters long' })
  tfa: string;
}

export class ProfileDto {
  @IsOptional()
  @Length(2, 30)
  @Matches(userRegex)
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsBoolean()
  tfa?: boolean;
}

export class ProfileTfaDto {
  @Length(6, 6, { message: 'code must be 6 characters long' })
  @IsString()
  @IsDecimal()
  code: string;
}

export class AddDto {
  @IsBoolean()
  add: boolean;
}

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  filter: string;
}
