import { Module } from '@nestjs/common';
import ImageModule from './image/image.module';
import UserModule from './user/user.module';
import GameModule from './game/game.module';
import ChatModule from './chat/chat.module';
import GatewaysModule from './gateways/gateways.module';

@Module({
  imports: [UserModule, ImageModule, GameModule, ChatModule, GatewaysModule],
})
export default class AppModule {}
