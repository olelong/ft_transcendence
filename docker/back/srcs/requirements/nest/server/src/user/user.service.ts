import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PrismaPromise, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(name: string): Promise<void> {
    const newUser: Prisma.UserCreateInput = {
      id: name,
      name: name,
      avatar: 'null',
      tfa: 'null',
    };
    await this.prisma.user.create({ data: newUser });
  }

  users(): PrismaPromise<User[]> {
    return this.prisma.user.findMany();
  }
}
