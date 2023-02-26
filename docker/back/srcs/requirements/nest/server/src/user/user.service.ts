import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { User, Achievement } from '@prisma/client';

import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';
import * as qr from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

import PrismaService from '../prisma/prisma.service';
import { ProfileDto } from './user.dto';
import {
  LoginRes,
  LoginTfaRes,
  ProfileRes,
  PutProfileRes,
  Achievement as ReqAchievement,
  Game as ReqGame,
  ProfileTfaRes,
  okRes,
  LeaderboardUser,
  FriendsRes,
  BlockedRes,
} from './user.interface';

@Injectable()
export default class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly req: Request & { userId: string },
  ) {}

  async firstLogin(access_token: string): LoginRes {
    const login42 = await this.getLogin42(access_token);
    const user = await this.prisma.user.findUnique({
      where: {
        id: login42,
      },
    });
    if (user) {
      if (!user.tfa || user.tfa.endsWith('pending')) {
        await this.prisma.user.update({
          where: {
            id: login42,
          },
          data: {
            tfa: null,
          },
        });
        return {
          tfaRequired: false,
          newUser: false,
          token: this.getToken(login42),
        };
      }
      return { tfaRequired: true, newUser: false };
    } else {
      await this.prisma.user.create({
        data: {
          id: login42,
          name: login42,
          avatar: '/image/default.jpg',
          theme: 'classic',
        },
      });
      return {
        tfaRequired: false,
        newUser: true,
        token: this.getToken(login42),
      };
    }
  }

  async loginWithTfa(access_token: string, tfaCode: string): LoginTfaRes {
    const login42 = await this.getLogin42(access_token);
    const user = await this.prisma.user.findUnique({
      where: {
        id: login42,
      },
    });
    if (!user || !this.verifyTfaCode(tfaCode, user.tfa))
      throw new UnauthorizedException();
    return { token: this.getToken(login42) };
  }

  async getProfile(id: string): ProfileRes {
    const res: Awaited<Promise<ProfileRes>> = {
      id: '',
      name: '',
      avatar: '',
      achievements: [],
      games: [],
      stats: {
        wins: 0,
        loses: 0,
        rank: 0,
      },
    };
    if (id === undefined) id = this.req.userId;
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: { achievements: true },
    });
    if (!user)
      throw new NotFoundException(
        'User not found' + id === this.req.userId && ', please login',
      );
    res.id = user.id;
    res.name = user.name;
    res.avatar = user.avatar;

    /* ACHIEVEMENTS */
    const achievementsFinished = await this.dbAchievementsToReqAchievements(
      id,
      user.achievements,
      false,
    );
    const otherAchievements = await this.dbAchievementsToReqAchievements(
      id,
      await this.prisma.achievement.findMany({
        where: { NOT: { users: { some: { id: id } } } },
      }),
    );
    // Update finished achievements
    await Promise.all(
      otherAchievements
        .filter((achievement) => achievement.score === achievement.goal)
        .map(async (achievement) => {
          await this.prisma.achievement.update({
            where: { desc: achievement.desc },
            data: {
              users: { connect: { id: id } },
            },
          });
        }),
    );
    res.achievements = [...achievementsFinished, ...otherAchievements];

    /* GAMES */
    [res.stats.wins, res.stats.loses, res.games] = await this.getGamesStats(id);
    res.stats.rank =
      (await this.getFullLeaderboard()).findIndex((user) => user.id === id) + 1;

    if (id === this.req.userId) {
      res.theme = user.theme;
      res.tfa = !(!user.tfa || user.tfa.endsWith('pending'));
    }
    return res;
  }

  async changeProfile({ name, avatar, theme, tfa }: ProfileDto): PutProfileRes {
    const res: Awaited<Promise<PutProfileRes>> = {};
    const user = await this.prisma.user.findUnique({
      where: {
        id: this.req.userId,
      },
    });
    if (!user) throw new NotFoundException('User not found, please login');
    if (name) {
      res.name = false;
      const users = await this.prisma.user.findMany({
        where: {
          name: name,
          NOT: {
            id: this.req.userId,
          },
        },
      });
      if (users.length === 0) res.name = true;
    }
    if (avatar) {
      if (user.avatar !== avatar && user.avatar !== '/image/default.jpg') {
        const imageToRemove =
          '../src/image/uploads/' + path.parse(user.avatar).base;
        fs.unlink(path.join(__dirname, imageToRemove), (err) => {
          if (err) console.error(err);
        });
      }
    }
    if (tfa !== undefined) {
      if ((!user.tfa || user.tfa.endsWith('pending')) && tfa === true) {
        const secret = speakeasy.generateSecret({ name: 'CatPong' });
        res.tfa = await qr.toDataURL(secret.otpauth_url);

        user.tfa = secret.base32 + 'pending';
      } else if (user.tfa && tfa === false) user.tfa = null;
    }
    await this.prisma.user.update({
      where: {
        id: this.req.userId,
      },
      data: {
        name: res.name ? name : user.name,
        avatar: avatar,
        theme: theme,
        tfa: user.tfa,
      },
    });
    if (Object.keys(res).length === 0) res.ok = true;
    return res;
  }

  async validateTfa(code: string): ProfileTfaRes {
    const user = await this.prisma.user.findUnique({
      where: {
        id: this.req.userId,
      },
    });
    if (!user) throw new NotFoundException('User not found, please login');
    if (!user.tfa) throw new UnauthorizedException('Tfa not enabled!');
    if (user.tfa.endsWith('pending')) {
      const realTfa: string = user.tfa.slice(0, -7);
      let valid = false;
      if (this.verifyTfaCode(code, realTfa)) {
        valid = true;
        await this.prisma.user.update({
          where: {
            id: this.req.userId,
          },
          data: {
            tfa: realTfa,
          },
        });
      }
      return { valid: valid };
    }
    return { valid: this.verifyTfaCode(code, user.tfa) };
  }

  /* Friends/Blocked */
  async getFriends(): FriendsRes {
    const friends = await this.prisma.user.findMany({
      where: {
        AND: [
          { friends: { some: { id: this.req.userId } } },
          { friendOf: { some: { id: this.req.userId } } },
        ],
      },
      select: { id: true, name: true, avatar: true },
    });
    const pending = await this.prisma.user.findMany({
      where: {
        AND: [
          { friends: { some: { id: this.req.userId } } },
          { NOT: { friendOf: { some: { id: this.req.userId } } } },
        ],
      },
      select: { id: true, name: true, avatar: true },
    });
    return { friends, pending };
  }
  async getBlocked(): BlockedRes {
    const users = await this.prisma.user.findMany({
      where: {
        blockedBy: { some: { id: this.req.userId } },
      },
      select: { id: true, name: true, avatar: true },
    });
    return { users };
  }

  async checkFriend(id: string): okRes {
    if (id === this.req.userId) return { ok: false };
    const friend = await this.prisma.user.findFirst({
      where: {
        AND: [
          { id: id },
          { friends: { some: { id: this.req.userId } } },
          { friendOf: { some: { id: this.req.userId } } },
        ],
      },
    });
    if (friend) return { ok: true };
    return { ok: false };
  }
  async checkBlocked(id: string): okRes {
    if (id === this.req.userId) return { ok: false };
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) throw new NotFoundException(`User not found`);
    const block = await this.prisma.user.findFirst({
      where: {
        AND: [
          { id: id },
          {
            OR: [
              { blocked: { some: { id: this.req.userId } } },
              { blockedBy: { some: { id: this.req.userId } } },
            ],
          },
        ],
      },
    });
    if (block) return { ok: true };
    return { ok: false };
  }

  async addFriend(userId: string, add: boolean): okRes {
    try {
      if (userId === this.req.userId) return { ok: false };
      if (add) {
        // Check if one user haven't blocked the other
        const user = (await this.prisma.user.findUnique({
          where: { id: this.req.userId },
          include: {
            blocked: {
              select: { id: true },
            },
            blockedBy: {
              select: { id: true },
            },
          },
        })) as User & {
          blocked: [{ id: string }];
          blockedBy: [{ id: string }];
        };
        if (!user) throw new NotFoundException('User not found, please login');

        if (
          user.blocked.some((user: { id: string }) => user.id === userId) ||
          user.blockedBy.some((user: { id: string }) => user.id === userId)
        )
          return { ok: false };
      }

      // Add or remove friend
      await this.prisma.user.update({
        where: {
          id: this.req.userId,
        },
        data: {
          friends: add
            ? {
                connect: { id: userId },
              }
            : {
                disconnect: { id: userId },
              },
        },
      });
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }
  async blockUser(userId: string, add: boolean): okRes {
    try {
      if (userId === this.req.userId) return { ok: false };

      // Remove friendships
      await this.prisma.user.update({
        where: {
          id: this.req.userId,
        },
        data: {
          friends: {
            disconnect: { id: userId },
          },
          friendOf: {
            disconnect: { id: userId },
          },
        },
      });

      await this.prisma.user.update({
        where: {
          id: this.req.userId,
        },
        data: {
          blocked: add
            ? {
                connect: { id: userId },
              }
            : {
                disconnect: { id: userId },
              },
        },
      });
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }

  /* UTILITY FUNCTIONS */
  private getToken(userId: string): string {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: '24h',
    });
  }

  private verifyTfaCode(code: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
    });
  }

  private async getLogin42(access_token: string): Promise<string> {
    const res = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    });
    if (res.status >= 400) throw new UnauthorizedException();
    const data = (await res.json()) as { login: string };
    return data.login;
  }

  private async dbAchievementsToReqAchievements(
    id: string,
    dbAchievements: Achievement[],
    calculateScore = true,
  ): Promise<ReqAchievement[]> {
    return await Promise.all(
      dbAchievements.map(async (achievement) => {
        const [score, goal] = await this.getAchievementInfos(
          id,
          achievement.desc,
          calculateScore,
        );
        if (score === -1) return null;
        delete achievement.id;
        return {
          ...achievement,
          score: score,
          goal: goal,
        };
      }),
    );
  }

  private async getAchievementInfos(
    id: string,
    desc: string,
    calculateScore = true,
  ): Promise<[number, number]> {
    // Create all achievements with their regex and associated calculating score function
    const allAchievements = new Map<RegExp, () => Promise<number>>();
    allAchievements.set(
      /^Win (\d*) games?\.$/,
      async () =>
        (
          await this.prisma.user.findUnique({
            where: { id: id },
            include: { gamesWon: true },
          })
        ).gamesWon.length,
    );
    allAchievements.set(
      /^Add (\d*) friends?\.$/,
      async () =>
        (
          await this.prisma.user.findMany({
            where: {
              friends: { some: { id: id } },
              friendOf: { some: { id: id } },
            },
          })
        ).length,
    );
    // Loop over map to calculate score and goal
    const getGoal = (regex: RegExp): number => parseInt(desc.match(regex)[1]);
    for (const [regex, getScore] of allAchievements) {
      if (regex.test(desc)) {
        const goal = getGoal(regex);
        if (!calculateScore) return [goal, goal];
        const score = await getScore();
        return [Math.min(score, goal), goal];
      }
    }
    return [-1, -1];
  }

  private async getGamesStats(
    id: string,
  ): Promise<[number, number, ReqGame[]]> {
    const dbGames = await this.prisma.game.findMany({
      where: { OR: [{ winnerId: id }, { loserId: id }] },
      include: { winner: true, loser: true },
    });
    const games: ReqGame[] = dbGames.map((game) => {
      if (game.winnerId === id)
        return {
          name: game.loser.name,
          myScore: game.winnerScore,
          enemyScore: game.loserScore,
          timestamp: game.time,
        };
      else
        return {
          name: game.winner.name,
          myScore: game.loserScore,
          enemyScore: game.winnerScore,
          timestamp: game.time,
        };
    });
    const wins = games.filter((game) => game.myScore > game.enemyScore).length;
    const loses = games.length - wins;
    return [wins, loses, games];
  }

  async getFullLeaderboard(): Promise<LeaderboardUser[]> {
    const dbUsers = await this.prisma.user.findMany();
    const users: (LeaderboardUser & { games: ReqGame[] })[] = [];
    for (const dbUser of dbUsers) {
      const [wins, loses, games] = await this.getGamesStats(dbUser.id);
      if (games.length === 0) continue;
      const winRate = wins / (wins + loses);
      delete dbUser.tfa;
      delete dbUser.theme;
      users.push({ ...dbUser, score: winRate, games });
    }
    users.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      else if (a.games.length !== b.games.length)
        return b.games.length - a.games.length;
      else {
        const sortGames = (gameA: ReqGame, gameB: ReqGame): number => {
          const gameAWon = gameA.myScore > gameA.enemyScore;
          const gameBWon = gameB.myScore > gameB.enemyScore;
          if (gameAWon !== gameBWon) return gameAWon ? -1 : 1;
          return gameB.timestamp.getTime() - gameA.timestamp.getTime();
        };
        a.games.sort(sortGames);
        b.games.sort(sortGames);
        return b.games[0].timestamp.getTime() - a.games[0].timestamp.getTime();
      }
    });
    for (const user of users) {
      user.score = Math.round(user.score * 100);
      delete user.games;
    }
    return users;
  }
}
