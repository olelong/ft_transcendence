import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import AppModule from './app.module';

interface WebpackModule extends NodeJS.Module {
  hot: {
    accept(): void;
    dispose(cb: () => Promise<void>): void;
  };
}
declare const module: WebpackModule;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3001);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap().catch(console.error);
