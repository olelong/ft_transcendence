import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import AppModule from './app.module';
import AuthGuard from './auth.guard';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,PUT,POST,DELETE',
    credentials: true,
  });
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthGuard(reflector));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3001);
}
bootstrap().catch(console.error);
