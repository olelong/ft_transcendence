import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { createAchievements } from '../achievements';

@Injectable()
export default class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
    const achievements = await this.achievement.findMany();
    if (achievements.length === 0) await createAchievements(this);
  }

  enableShutdownHooks(app: INestApplication): void {
    this.$on('beforeExit', () => async () => {
      await app.close();
    });
  }
}
