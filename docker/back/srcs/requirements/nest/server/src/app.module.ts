import { Module } from '@nestjs/common';
import ImageModule from './image/image.module';
import UserModule from './user/user.module';
import ChatModule from './chat/chat.module';
import GameModule from './game/game.module';

@Module({
  imports: [UserModule, ChatModule, GameModule, ImageModule],
})
export default class AppModule {}
