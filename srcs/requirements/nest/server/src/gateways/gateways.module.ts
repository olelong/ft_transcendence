import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import ChatModule from './chat/chat.module';
import GameModule from './game/game.module';

@Module({
  imports: [ChatModule, GameModule, ThrottlerModule.forRoot()],
})
export default class GatewaysModule {}
