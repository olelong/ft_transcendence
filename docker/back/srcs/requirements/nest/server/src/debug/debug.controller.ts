import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { Achievement, Game, User, PrismaPromise } from '@prisma/client';

import DebugService from './debug.service';
import { Public } from '../auth.guard';
import { okRes } from '../user/user.interface';

@Controller('debug')
export default class DebugController {
  constructor(private readonly debugService: DebugService) {}

  /* GAME */
  @Public()
  @Post('game')
  createGame(
    @Body() { winnerId, loserId }: { winnerId: string; loserId: string },
  ): void {
    void this.debugService.createGame(winnerId, loserId);
  }

  @Public()
  @Get('game')
  getGames(): PrismaPromise<Game[]> {
    return this.debugService.getGames();
  }

  /* ACHIEVEMENTS */
  @Public()
  @Post('achievements')
  createAchievement(@Body() { desc }: { desc: string }): void {
    void this.debugService.createAchievement(desc);
  }

  @Public()
  @Get('achievements')
  getAchievements(): PrismaPromise<Achievement[]> {
    return this.debugService.getAchievements();
  }

  @Public()
  @Delete('achievements')
  deleteAchievements(): void {
    void this.debugService.deleteAchievements();
  }

  /* USER */
  @Public()
  @Get('user')
  users(): PrismaPromise<User[]> {
    return this.debugService.users();
  }

  @Public()
  @Post('user')
  addUser(@Body() { id }: { id: string }): okRes & { token?: string } {
    return this.debugService.addUser(id);
  }
}
