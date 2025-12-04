import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config/environment.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<EnvironmentVariables>);
  const port = configService.get('APP_PORT') || 3000;
  const apiRoute = configService.get('API_ROUTE') || 'api';
  const nodeEnv = configService.get('NODE_ENV');

  // Global prefix (ex: /api, /test, /omidev)
  app.setGlobalPrefix(apiRoute);

  // Cookie parser pour les tokens
  app.use(cookieParser());

  // Validation pipe pour les DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  if (nodeEnv !== 'test') {
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'authorization',
        'content-type',
        'x-xsrf-token',
        'x-device-id',
        'x-access-token',
        'x-tenant-id',
      ],
    });
  }

  await app.listen(port);
  console.log(`Application demarree sur le port ${port} avec prefix /${apiRoute}`);
}

bootstrap();
