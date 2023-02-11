import { Module } from '@nestjs/common';
import ManagersModule from '../managers/managers.module';
import GameGateway from './game.gateway';
import GameService from './game.service';

@Module({
  imports: [ManagersModule],
  providers: [GameGateway, GameService],
})
export default class GameModule {}
