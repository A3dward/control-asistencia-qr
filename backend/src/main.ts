import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Todas las rutas comenzarán con /api
  app.setGlobalPrefix('api');

  // Permitirá la comunicación con el frontend React
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Validación global de los datos recibidos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);

  console.log(`API ejecutándose en http://localhost:${port}/api`);
}

bootstrap();