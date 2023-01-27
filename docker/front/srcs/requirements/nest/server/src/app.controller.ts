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
    if (id === undefined) {
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
  //changeUserProfile(@Body() body): any {}
}
