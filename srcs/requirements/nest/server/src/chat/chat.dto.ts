import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

const userIdRegex = '^\\$?[\\w-]+$';
const channelRegex = '^[\\w -]+$';

export class CreateChanDto {
  @Length(2, 30)
  @Matches(channelRegex)
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  avatar?: string;

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

export class EditChanDto {
  @IsOptional()
  @Length(2, 30)
  @Matches(channelRegex)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  avatar?: string;

  @IsOptional()
  @IsIn(['public', 'protected', 'private'])
  type?: string;

  @IsOptional()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password?: string;
}

export class JoinChanDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;
}

export class LeaveChanDto {
  @IsOptional()
  @Length(2, 31)
  @Matches(userIdRegex)
  id?: string;
}

export class AddUserDto {
  @Length(2, 31)
  @Matches(userIdRegex)
  id: string;
}

export class RoleDto {
  @Length(2, 31)
  @Matches(userIdRegex)
  id: string;

  @IsIn(['member', 'admin', 'owner'])
  role: string;
}
