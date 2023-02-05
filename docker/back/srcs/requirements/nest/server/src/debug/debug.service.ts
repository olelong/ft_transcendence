import { Injectable } from '@nestjs/common';
import { Achievement, Game, User, PrismaPromise } from '@prisma/client';

import PrismaService from '../prisma/prisma.service';
import { okRes } from '../user/user.interface';

@Injectable()
export default class DebugService {
  constructor(private prisma: PrismaService) {}

  /* GAME */
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

  /* ACHIEVEMENTS */
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

  /* USER */
  users(): PrismaPromise<User[]> {
    return this.prisma.user.findMany({
      include: {
        friends: { select: { id: true } },
        friendOf: { select: { id: true } },
        blocked: { select: { id: true } },
        blockedBy: { select: { id: true } },
      },
    });
  }

  async addUser(id: string): okRes {
    try {
      await this.prisma.user.create({
        data: {
          id: id,
          name: id,
          avatar: '/image/default.jpg',
          theme: 'classic',
        },
      });
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }
}
