import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    const newUser: Prisma.UserCreateInput = {
      id: name,
      name: name,
      avatar: 'null',
      tfa: 'null',
    };
    await this.prisma.user.create({ data: newUser });
  }

  users() {
    return this.prisma.user.findMany();
  }
}
