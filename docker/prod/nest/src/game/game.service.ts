import { Injectable } from '@nestjs/common';

import PrismaService from '../prisma/prisma.service';
import { Achievement, Game, PrismaPromise } from '@prisma/client';

@Injectable()
export default class GameService {
  constructor(private prisma: PrismaService) {}

  async createGame(winnerId: string, loserId: string): Promise<void> {
    await this.prisma.game.create({
      data: {
        time: new Date(),
        winnerId: winnerId,
        loserId: loserId,
        winnerScore: 11,
        loserScore: 9,
      },
    });
  }

  getGames(): PrismaPromise<Game[]> {
    return this.prisma.game.findMany();
  }

  async createAchievement(desc: string): Promise<void> {
    await this.prisma.achievement.create({
      data: {
        name: 'Achievement',
        desc: desc,
        img: "vide pour l'instant",
      },
    });
  }

  getAchievements(): PrismaPromise<Achievement[]> {
    return this.prisma.achievement.findMany({
      include: { users: { select: { id: true } } },
    });
  }

  async deleteAchievements(): Promise<void> {
    await this.prisma.achievement.deleteMany();
  }
}
