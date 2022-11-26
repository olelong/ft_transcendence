import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('user') // localhost:3001/game
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('profile') // localhost:3001/game/tabby
  getHello(@Body() body: { id: string }): any {
    console.log(body);
    return this.appService.getHello(body);
  }
}
