import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../auth.guard';
import UserService from '../user/user.service';
import PrismaService from '../prisma/prisma.service';
import { LeaderboardUser } from '../user/user.interface';

@ApiTags('Game')
@Controller('game')
export default class GameController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('leaderboard')
  async getLeaderboard(): Promise<{ users: LeaderboardUser[] }> {
    const userService = new UserService(this.prisma, null);
    const leaderboard = await userService.getFullLeaderboard();
    if (leaderboard.length > 3) leaderboard.length = 3;
    return { users: leaderboard };
  }
}
