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
} from './user.dto';
import {
  LoginRes,
  LoginTfaRes,
  ProfileRes,
  PutProfileRes,
  ProfileTfaRes,
  FriendsRes,
  BlockedRes,
  SearchRes,
  okRes,
} from './user.interface';

@ApiTags('User')
@Controller('user')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('login')
  firstLogin(@Body() { access_token }: LoginDto): LoginRes {
    return this.userService.firstLogin(access_token);
  }

  @Public()
  @Post('login/tfa')
  loginWithTfa(@Body() { access_token, tfa }: LoginTfaDto): LoginTfaRes {
    return this.userService.loginWithTfa(access_token, tfa);
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
