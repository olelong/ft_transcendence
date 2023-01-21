import { Module } from '@nestjs/common';
import { GameServerGateway } from './gameserver.gateway';

@Module({ providers: [GameServerGateway] })
export class GameServerModule {}
