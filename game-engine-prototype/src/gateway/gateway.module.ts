import { Module } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { GameEngineGateway } from './gateway';

@Module({ providers: [GameEngineGateway, SchedulerRegistry] })
export class GatewayModule {}
