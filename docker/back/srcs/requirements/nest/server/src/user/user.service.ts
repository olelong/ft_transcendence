import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import PrismaService from '../prisma/prisma.service';
import { PrismaPromise, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';
import * as qr from 'qrcode';

import { ProfileDto } from './user.dto';
import {
  LoginRes,
  LoginTfaRes,
  ProfileRes,
  ProfileTfaRes,
} from './user.interface';

@Injectable()
export default class UserService {
  constructor(private prisma: PrismaService) {}

  async firstLogin(login42: string): LoginRes {
    const user = await this.prisma.user.findUnique({
      where: {
        id: login42,
      },
    });
    if (user) {
      if (!user.tfa || user.tfa.endsWith('pending')) {
        if (user.tfa) {
          await this.prisma.user.update({
            where: {
              id: login42,
            },
            data: {
              tfa: null,
            },
          });
        }
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

  async loginWithTfa(login42: string, tfaCode: string): LoginTfaRes {
    const user = await this.prisma.user.findUnique({
      where: {
        id: login42,
      },
    });
    if (!this.verifyTfaCode(tfaCode, user.tfa))
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return { token: this.getToken(login42) };
  }

  async changeProfile({ name, avatar, theme, tfa }: ProfileDto): ProfileRes {
    const res: Awaited<Promise<ProfileRes>> = {};
    const user = await this.prisma.user.findUnique({
      where: {
        id: 'whazami',
      },
    });
    if (name) {
      res.name = false;
      const users = await this.prisma.user.findMany({
        where: {
          name: name,
          NOT: {
            id: 'whazami',
          },
        },
      });
      if (users.length === 0) res.name = true;
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
        id: 'whazami',
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
        id: 'whazami',
      },
    });
    if (!user.tfa)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    else {
      if (user.tfa.endsWith('pending')) {
        user.tfa = user.tfa.slice(0, -7);
        let valid = true;
        if (!this.verifyTfaCode(code, user.tfa)) {
          valid = false;
          user.tfa = null;
        }
        await this.prisma.user.update({
          where: {
            id: 'whazami',
          },
          data: {
            tfa: user.tfa,
          },
        });
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

  /* DEBUG METHODS */
  users(): PrismaPromise<User[]> {
    return this.prisma.user.findMany();
  }
}
