import { BadRequestException, Injectable } from '@nestjs/common';
import { Achievement, Game, User, PrismaPromise } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { okRes } from 'src/user/user.interface';

import PrismaService from '../prisma/prisma.service';

@Injectable()
export default class DebugService {
  constructor(private prisma: PrismaService) {}

  /* GAME */
  async createGame(winnerId: string, loserId: string): okRes {
    try {
      await this.prisma.game.create({
        data: {
          time: new Date(),
          winnerId: winnerId,
          loserId: loserId,
          winnerScore: 11,
          loserScore: 9,
        },
      });
      return { ok: true };
    } catch {
      throw new BadRequestException('winner or loser does not exist');
    }
  }

  getGames(): PrismaPromise<Game[]> {
    return this.prisma.game.findMany();
  }

  /* ACHIEVEMENTS */
  async createAchievement(desc: string): okRes {
    try {
      await this.prisma.achievement.create({
        data: {
          name: 'Achievement',
          desc: desc,
          img: "vide pour l'instant",
        },
      });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

  getAchievements(): PrismaPromise<Achievement[]> {
    return this.prisma.achievement.findMany({
      include: { users: { select: { id: true } } },
    });
  }

  async deleteAchievements(): okRes {
    try {
      await this.prisma.achievement.deleteMany();
      return { ok: true };
    } catch {
      return { ok: false };
    }
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

  async addUser(id: string): Promise<{ ok: boolean; token?: string }> {
    try {
      await this.prisma.user.create({
        data: {
          id: id,
          name: id,
          avatar: '/image/default.jpg',
          theme: 'classic',
        },
      });
      return {
        ok: true,
        token: jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
          expiresIn: '24h',
        }),
      };
    } catch (e) {
      return { ok: false };
    }
  }
}
