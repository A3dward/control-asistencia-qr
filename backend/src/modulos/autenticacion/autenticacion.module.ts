import {
  Global,
  Module,
} from '@nestjs/common';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { JwtModule } from '@nestjs/jwt';

import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionRepository } from './autenticacion.repository';

import { AutenticacionGuard } from './guards/autenticacion.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [
    ConfigModule,

    JwtModule.registerAsync({
      global: true,

      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => {
        const secreto =
          configService.get<string>(
            'JWT_SECRET',
          );

        if (!secreto) {
          throw new Error(
            'JWT_SECRET no se encuentra configurado.',
          );
        }

        return {
          secret: secreto,

          signOptions: {
            expiresIn: '8h',
          },
        };
      },
    }),
  ],

  controllers: [
    AutenticacionController,
  ],

  providers: [
    AutenticacionService,
    AutenticacionRepository,
    AutenticacionGuard,
    RolesGuard,
  ],

  exports: [
    AutenticacionService,
    AutenticacionRepository,
    AutenticacionGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AutenticacionModule {}