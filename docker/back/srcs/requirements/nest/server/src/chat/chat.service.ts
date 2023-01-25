import { Injectable } from '@nestjs/common';

import PrismaService from '../prisma/prisma.service';

@Injectable()
export default class ChatService {
  constructor(private prisma: PrismaService) {}

  sayHello(): string {
    return 'Chat service is working!';
  }
}
