import { Controller, Param, Body, Get, Post, Put } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { Public } from '../auth.guard';
import UserService from './user.service';
import {
  LoginDto,
  LoginTfaDto,
  ProfileDto,
  ProfileTfaDto,
  AddDto,
  SearchDto,
  CSignUpDto,
  CLoginDto,
  CLoginTfaDto,
} from './user.dto';
import {
  LoginRes,
  CLoginRes,
  ProfileRes,
  PutProfileRes,
  ProfileTfaRes,
  FriendsRes,
  BlockedRes,
  SearchRes,
  TokenRes,
  okRes,
} from './user.interface';

@ApiTags('User')
@Controller('user')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  /* 42 login */
  @Public()
  @Post('login')
  firstLogin(@Body() { access_token }: LoginDto): LoginRes {
    return this.userService.firstLogin(access_token);
  }
  @Public()
  @Post('login/tfa')
  loginWithTfa(@Body() { access_token, tfa }: LoginTfaDto): TokenRes {
    return this.userService.loginWithTfa(access_token, tfa);
  }

  /* Classic login */
  @Public()
  @Post('classic/signup')
  classicSignUp(@Body() { login, password }: CSignUpDto): TokenRes {
    return this.userService.classicSignUp(login, password);
  }
  @Public()
  @Post('classic/login')
  classicLogin(@Body() { login, password }: CLoginDto): CLoginRes {
    return this.userService.classicLogin(login, password);
  }
  @Public()
  @Post('classic/login/tfa')
  classicLoginTfa(@Body() { login, password, tfa }: CLoginTfaDto): TokenRes {
    return this.userService.classicLoginTfa(login, password, tfa);
  }

  @ApiParam({ name: 'id', allowEmptyValue: true })
  @Get('profile/:id?')
  getProfile(@Param('id') id?: string): ProfileRes {
    return this.userService.getProfile(id);
  }

  @Put('profile')
  changeProfile(@Body() body: ProfileDto): PutProfileRes {
    return this.userService.changeProfile(body);
  }

  @Post('profile/tfavalidation')
  validateTfa(@Body() { code }: ProfileTfaDto): ProfileTfaRes {
    return this.userService.validateTfa(code);
  }

  /* Friends/Blocked */
  @Get('friends')
  getFriends(): FriendsRes {
    return this.userService.getFriends();
  }
  @Get('blocks')
  getBlocked(): BlockedRes {
    return this.userService.getBlocked();
  }

  @Get('friends/:id')
  checkFriend(@Param('id') id: string): okRes {
    return this.userService.checkFriend(id);
  }
  @Get('blocks/:id')
  checkBlocked(@Param('id') id: string): okRes {
    return this.userService.checkBlocked(id);
  }

  @Post('friends/:id')
  addFriend(@Param('id') id: string, @Body() { add }: AddDto): okRes {
    return this.userService.addFriend(id, add);
  }
  @Post('blocks/:id')
  blockUser(@Param('id') id: string, @Body() { add }: AddDto): okRes {
    return this.userService.blockUser(id, add);
  }

  @Post('search')
  searchUsers(@Body() { filter }: SearchDto): SearchRes {
    return this.userService.searchUsers(filter);
  }
}
