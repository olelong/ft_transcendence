import { Module } from '@nestjs/common';
import ManagersModule from '../managers/managers.module';
import ChatGateway from './chat.gateway';
import ChatService from './chat.service';

@Module({
  imports: [ManagersModule],
  providers: [ChatGateway, ChatService],
})
export default class ChatModule {}
