import { Module } from '@nestjs/common';
import ChatModule from './chat/chat.module';
import GameModule from './game/game.module';

@Module({
  imports: [ChatModule, GameModule],
})
export default class GatewaysModule {}
