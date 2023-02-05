import { Module } from '@nestjs/common';
import GameGateway from './gateways/game/game.gateway';
import ChatGateway from './gateways/chat/chat.gateway';
import DebugModule from './debug/debug.module';
import ImageModule from './image/image.module';
import UserModule from './user/user.module';
import GameModule from './game/game.module';

@Module({
  imports: [UserModule, GameModule, ImageModule, DebugModule],
  providers: [GameGateway, ChatGateway],
})
export default class AppModule {}
