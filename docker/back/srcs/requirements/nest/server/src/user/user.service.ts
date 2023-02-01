import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import PrismaService from '../prisma/prisma.service';
import { PrismaPromise, User, Achievement } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';
import * as qr from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

import { ProfileDto } from './user.dto';
import {
  LoginRes,
  LoginTfaRes,
  ProfileRes,
  PutProfileRes,
  Achievement as ReqAchievement,
  ProfileTfaRes,
  okRes,
  FriendsRes,
  BlockedRes,
} from './user.interface';
import { REQUEST } from '@nestjs/core';

@Injectable()
export default class UserService {
  constructor(
    private prisma: PrismaService,
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
          token: this.getToken(login42),
        };
      }
      return { tfaRequired: true };
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
      stats: [],
      games: [],
    };
    if (id === undefined) id = this.req.userId;
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: { achievements: true },
    });
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

    if (id === this.req.userId) {
      res.theme = user.theme;
      res.tfa = user.tfa ? true : false;
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
    if (!user) return { ok: false };
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
      if (!user.tfa && tfa === true) {
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
    if (!user || !user.tfa) throw new UnauthorizedException();
    else {
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
    });
    const pending = await this.prisma.user.findMany({
      where: {
        AND: [
          { friends: { some: { id: this.req.userId } } },
          { NOT: { friendOf: { some: { id: this.req.userId } } } },
        ],
      },
    });
    return { friends, pending };
  }
  async getBlocked(): BlockedRes {
    const users = await this.prisma.user.findMany({
      where: {
        blockedBy: { some: { id: this.req.userId } },
      },
    });
    return { users };
  }

  async checkFriend(id: string): okRes {
    if (id === this.req.userId) return { ok: false };
    const friend = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: id },
          { friends: { some: { id: this.req.userId } } },
          { friendOf: { some: { id: this.req.userId } } },
        ],
      },
    });
    if (friend.length > 0) return { ok: true };
    return { ok: false };
  }
  async checkBlocked(id: string): okRes {
    if (id === this.req.userId) return { ok: false };
    const block = await this.prisma.user.findMany({
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
    if (block.length > 0) return { ok: true };
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

  /* DEBUG METHODS */
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
