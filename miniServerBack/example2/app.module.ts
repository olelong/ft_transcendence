import { Module } from '@nestjs/common';
import { msModule } from './miniServer/ms.module';

@Module({
  imports: [msModule],
})
export class AppModule {}
