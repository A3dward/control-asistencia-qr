import {
  ValidationPipe,
} from '@nestjs/common';

import {
  NestFactory,
} from '@nestjs/core';

import {
  ConfigService,
} from '@nestjs/config';

import {
  AppModule,
} from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  const configService =
    app.get(
      ConfigService,
    );

  // =====================================
  // PREFIJO API
  // =====================================

  app.setGlobalPrefix(
    'api',
  );

  // =====================================
  // CORS
  // =====================================

  const frontendUrl =
    configService.get<string>(
      'FRONTEND_URL',
    );

  const origenesPermitidos =
    [
      'http://localhost:5173',
    ];

  if (frontendUrl) {
    origenesPermitidos.push(
      frontendUrl,
    );
  }

  app.enableCors({
    origin:
      origenesPermitidos,

    credentials:
      true,
  });

  // =====================================
  // VALIDACION
  // =====================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:
        true,

      forbidNonWhitelisted:
        true,

      transform:
        true,
    }),
  );

  // =====================================
  // PUERTO
  // =====================================

  const port =
    Number(
      configService.get<string>(
        'PORT',
      ) ??
        3000,
    );

  await app.listen(
    port,
    '0.0.0.0',
  );

  console.log(
    `API ejecutandose en puerto ${port}`,
  );
}

bootstrap();