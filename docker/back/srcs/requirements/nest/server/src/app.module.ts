import { Module } from '@nestjs/common';
import DebugModule from './debug/debug.module';
import ImageModule from './image/image.module';
import UserModule from './user/user.module';
import GameModule from './game/game.module';
import ChatModule from './chat/chat.module';
import GatewaysModule from './gateways/gateways.module';

@Module({
  imports: [
    UserModule,
    ImageModule,
    GameModule,
    ChatModule,
    GatewaysModule,
    DebugModule,
  ],
})
export default class AppModule {}
