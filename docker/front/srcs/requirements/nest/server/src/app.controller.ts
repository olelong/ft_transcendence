import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

export const imagesPath = './src/uploads/';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }

  @Get('/user/friends/:id')
  checkFriend(@Param('id') id: string): { ok: boolean } {
    return this.appService.checkFriend(id);
  }

  @Get('/user/friends')
  getFriends(@Query() { id, num }): any {
    return this.appService.getFriends(id, num);
  }

  @Get('/user/profile')
  getProfile(): any {
    return this.appService.getUserInfos();
  }

  @Get('/game/friendsplaying')
  getPlaying(): any {
    return this.appService.getFriendsPlaying();
  }

  @Get('/game/leaderboard')
  getLeaderBoard(): any {
    return this.appService.getLeaderBoard();
  }
  @Get('/game')
  getGameInfos(): any {
    return this.appService.getGameInfos();
  }

  @Get('/image/:imgname')
  sendImage(@Param('imgname') image: string, @Res() res: Response): void {
    res.sendFile(image, { root: imagesPath });
  }
}
