import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }

  @Get('/user/friends')
  getFriends(@Query() { id, num }): any {
    return this.appService.getFriends(id, num);
  }

  @Get('/user/profile/:id?')
  getProfile(@Param('id') id: string) {
    if (id === undefined) {
      return this.appService.getUserInfos();
    } else {
      return this.appService.getFriendUserInfos();
    }
  }

  @Get('/game/friendsplaying')
  getPlaying(): any {
    return this.appService.getFriendsPlaying();
  }
}
