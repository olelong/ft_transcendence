import { Module } from '@nestjs/common';
import ManagersModule from '../managers/managers.module';
import PrismaModule from '../../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import ChatGateway from './chat.gateway';
import ChatService from './chat.service';

@Module({
  imports: [ManagersModule, PrismaModule, ScheduleModule.forRoot()],
  providers: [ChatGateway, ChatService],
})
export default class ChatModule {}
