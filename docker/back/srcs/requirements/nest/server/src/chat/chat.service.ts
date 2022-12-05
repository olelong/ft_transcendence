import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import {
  PMChannel,
  PMMessage,
  DMChannel,
  DMMessage,
  Prisma,
} from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  sayHello() {
    return 'Chat service is working!';
  }
}
