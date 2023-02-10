import { Module } from '@nestjs/common';
import GameGateway from './game/game.gateway';
import ChatGateway from './chat/chat.gateway';
import ClientsManager from './clients-manager.service';
import UsersManager from './users-manager.service';
import GamesManager from './games-manager.service';
import ChatService from './chat/chat.service';
import GameService from './game/game.service';

@Module({
  providers: [
    GameGateway,
    GameService,
    ChatGateway,
    ChatService,
    ClientsManager,
    UsersManager,
    GamesManager,
  ],
})
export default class GatewaysModule {}
