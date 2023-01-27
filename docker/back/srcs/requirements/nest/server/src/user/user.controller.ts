import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { User, PrismaPromise } from '@prisma/client';

import UserService from './user.service';
import { LoginDto, LoginTfaDto, ProfileDto, ProfileTfaDto } from './user.dto';
import {
  LoginRes,
  LoginTfaRes,
  ProfileRes,
  ProfileTfaRes,
} from './user.interface';

@Controller('user')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  firstLogin(@Body() { access_token }: LoginDto): LoginRes {
    return this.userService.firstLogin(access_token);
  }

  @Post('login/tfa')
  loginWithTfa(@Body() { access_token, tfa }: LoginTfaDto): LoginTfaRes {
    return this.userService.loginWithTfa(access_token, tfa);
  }

  @Put('profile')
  changeProfile(@Body() body: ProfileDto): ProfileRes {
    return this.userService.changeProfile(body);
  }

  @Post('profile/tfavalidation')
  validateTfa(@Body() { code }: ProfileTfaDto): ProfileTfaRes {
    return this.userService.validateTfa(code);
  }

  /* DEBUG ROUTES */
  @Get()
  users(): PrismaPromise<User[]> {
    return this.userService.users();
  }
}
