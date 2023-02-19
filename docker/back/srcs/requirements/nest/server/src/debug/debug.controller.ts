import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Achievement, Game, User, PrismaPromise } from '@prisma/client';

import DebugService from './debug.service';
import { Public } from '../auth.guard';
import { okRes } from '../user/user.interface';
import { AchievementDto, GameDto, NewUserDto } from './debug.dto';

@ApiTags('Debug')
@Controller('debug')
export default class DebugController {
  constructor(private readonly debugService: DebugService) {}

  /* GAME */
  @Public()
  @Post('game')
  async createGame(@Body() { winnerId, loserId }: GameDto): okRes {
    return await this.debugService.createGame(winnerId, loserId);
  }

  @Public()
  @Get('game')
  getGames(): PrismaPromise<Game[]> {
    return this.debugService.getGames();
  }

  /* ACHIEVEMENTS */
  @Public()
  @Post('achievements')
  async createAchievement(@Body() { desc }: AchievementDto): okRes {
    return await this.debugService.createAchievement(desc);
  }

  @Public()
  @Get('achievements')
  getAchievements(): PrismaPromise<Achievement[]> {
    return this.debugService.getAchievements();
  }

  @Public()
  @Delete('achievements')
  async deleteAchievements(): okRes {
    return await this.debugService.deleteAchievements();
  }

  /* USER */
  @Public()
  @Get('user')
  users(): PrismaPromise<User[]> {
    return this.debugService.users();
  }

  @Public()
  @Post('user')
  addUser(@Body() { id }: NewUserDto): okRes & { token?: string } {
    return this.debugService.addUser(id);
  }
}
