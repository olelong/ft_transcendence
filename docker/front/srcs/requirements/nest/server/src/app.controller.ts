import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }

  @Get("/user/friends")
  getFriends(@Query() {id, num}): any {
    return this.appService.getFriends(id, num);
  }
  
  @Get('/user/profile')
  getProfile(): any {
    return this.appService.getUserInfos();
  }
}
