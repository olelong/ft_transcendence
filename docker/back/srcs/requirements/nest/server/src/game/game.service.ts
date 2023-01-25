import { Injectable } from '@nestjs/common';

import PrismaService from '../prisma/prisma.service';

@Injectable()
export default class GameService {
  constructor(private prisma: PrismaService) {}

  sayHello(): string {
    return 'Game service is working!';
  }
}
