import { Module } from '@nestjs/common';
import { GatewayService } from './gameserver.gateway';

@Module({ providers: [GatewayService] })
export class GatewayModule {}
