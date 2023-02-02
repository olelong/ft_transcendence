import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}

export class LoginTfaDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @Length(6, 6, { message: 'code must be 6 characters long' })
  @IsString()
  tfa: string;
}

export class ProfileDto {
  @IsOptional()
  @Length(2, 30)
  @Matches('^[\\w-]+$')
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
  code: string;
}

export class addDto {
  @IsBoolean()
  add: boolean;
}
