import { Module } from '@nestjs/common';
import ManagersModule from '../managers/managers.module';
import PrismaModule from '../../prisma/prisma.module';
import ChatGateway from './chat.gateway';
import ChatService from './chat.service';

@Module({
  imports: [ManagersModule, PrismaModule],
  providers: [ChatGateway, ChatService],
})
export default class ChatModule {}
