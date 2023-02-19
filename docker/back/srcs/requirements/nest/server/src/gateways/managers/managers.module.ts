import { Module } from '@nestjs/common';

import ClientsManager from './clients-manager.service';
import UsersManager from './users-manager.service';
import GamesManager from './games-manager.service';

@Module({
  providers: [ClientsManager, UsersManager, GamesManager],
  exports: [ClientsManager, UsersManager, GamesManager],
})
export default class ManagersModule {}
