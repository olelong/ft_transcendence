import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Put,
  Post,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/user/login')
  firstLogin(): any {
    return this.appService.firstLogin();
  }

  @Get('/user/friends')
  getFriends(@Query() { id, num }): any {
    return this.appService.getFriends(id, num);
  }

  @Get('/user/profile/:id?')
  getProfile(@Param('id') id: string) {
    if (id === undefined || id === 'olelong') {
      return this.appService.getUserInfos();
    } else if (id === 'yooyoo') {
      return this.appService.getFriendUserInfos();
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('/game/friendsplaying')
  getPlaying(): any {
    return this.appService.getFriendsPlaying();
  }

  @Put('/user/profile')
  changeUserProfile(@Body() body): any {
    return this.appService.putUserProfile(body);
  }

  @Post('/user/profile/tfavalidation')
  checkTfa(@Body() { code }: { code: string }) {
    if (code === '000000' || code === '' || code.length > 6)
      return { valid: false };
    return { valid: true };
  }
  //changeUserProfile(@Body() body): any {}

  @Post('/user/friends/:id')
  addFriend(@Body() { add }: { add: boolean }) {
    if (add === true) return { ok: true };
  }
}
