import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import PrismaService from '../prisma/prisma.service';
import { PrismaPromise, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

import { LoginRes } from './user.interface';

@Injectable()
export default class UserService {
  constructor(private prisma: PrismaService) {}

  async firstLogin(login42: string): LoginRes {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: login42,
        },
      });
      if (user) {
        if (user.tfa) return { tfaRequired: true };
        return {
          tfaRequired: false,
          token: this.getToken(login42),
        };
      } else {
        console.log('create');
        await this.prisma.user.create({
          data: {
            id: login42,
            name: login42,
            avatar: '/image/default.jpg',
          },
        });
        return {
          tfaRequired: false,
          token: this.getToken(login42),
        };
      }
    } catch (err) {
      console.error(err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /* UTILITY FUNCTIONS */
  private getToken(userId: string): string {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: '24h',
    });
  }

  /* DEBUG METHODS */
  users(): PrismaPromise<User[]> {
    return this.prisma.user.findMany();
  }
}
