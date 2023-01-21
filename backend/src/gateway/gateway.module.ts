import { Module } from '@nestjs/common';
import { ClientManager } from './Client/client';
import { GameManager } from './Game/game';
import { Gateway } from './gateway';
import { UserManager } from './User/user';

@Module({ providers: [Gateway, GameManager, ClientManager, UserManager] })
export class GatewayModule {}
