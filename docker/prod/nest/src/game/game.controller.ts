import { Controller, Body, Get, Post, Delete } from '@nestjs/common';
import { PrismaPromise, Game, Achievement } from '@prisma/client';

import GameService from './game.service';
import { CreateGameDto } from './game.dto';
import { Public } from 'src/auth.guard';

@Controller('game')
export default class GameController {
  constructor(private readonly gameService: GameService) {}

  /* DEBUG ROUTES */
  @Public()
  @Post()
  createGame(@Body() { winnerId, loserId }: CreateGameDto): void {
    void this.gameService.createGame(winnerId, loserId);
  }

  @Public()
  @Get()
  getGames(): PrismaPromise<Game[]> {
    return this.gameService.getGames();
  }

  @Public()
  @Post('achievements')
  createAchievement(@Body() { desc }: { desc: string }): void {
    void this.gameService.createAchievement(desc);
  }

  @Public()
  @Get('achievements')
  getAchievements(): PrismaPromise<Achievement[]> {
    return this.gameService.getAchievements();
  }

  @Public()
  @Delete('achievements')
  deleteAchievements(): void {
    void this.gameService.deleteAchievements();
  }
}
