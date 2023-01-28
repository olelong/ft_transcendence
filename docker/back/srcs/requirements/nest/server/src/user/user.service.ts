import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import PrismaService from '../prisma/prisma.service';
import { PrismaPromise, User } from '@prisma/client';
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
  ProfileTfaRes,
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
    if (!this.verifyTfaCode(tfaCode, user.tfa))
      throw new UnauthorizedException();
    return { token: this.getToken(login42) };
  }

  async changeProfile({ name, avatar, theme, tfa }: ProfileDto): ProfileRes {
    const res: Awaited<Promise<ProfileRes>> = {};
    const user = await this.prisma.user.findUnique({
      where: {
        id: this.req.userId,
      },
    });
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
    if (!user.tfa) throw new UnauthorizedException();
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

  /* DEBUG METHODS */
  users(): PrismaPromise<User[]> {
    return this.prisma.user.findMany();
  }
}
