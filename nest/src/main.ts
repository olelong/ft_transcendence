import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { createProxyMiddleware } from 'http-proxy-middleware';
import AppModule from './app.module';
import AuthGuard from './auth.guard';
import { SocketIOAdapter } from './gateways/utils/gateway-wrappers';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    allowedHeaders: 'Authorization, Content-Type, Accept',
    methods: 'GET,PUT,POST,DELETE',
    credentials: true,
  });
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthGuard(reflector));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useWebSocketAdapter(new SocketIOAdapter(app));
  app.use(
    '/42-api',
    createProxyMiddleware({
      target: 'https://api.intra.42.fr',
      changeOrigin: true,
      pathRewrite: {
        '^/42-api': '',
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CatPong API')
    .setDescription('API for CatPong application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap().catch(console.error);
