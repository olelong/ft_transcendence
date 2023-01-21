import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameServerModule } from './gateway/gamserver.module';

@Module({
  imports: [GameServerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
