import { Module } from '@nestjs/common';

import { SesionesClaseController } from './sesiones-clase.controller';
import { SesionesClaseService } from './sesiones-clase.service';
import { SesionesClaseRepository } from './sesiones-clase.repository';

@Module({
  controllers: [
    SesionesClaseController,
  ],

  providers: [
    SesionesClaseService,
    SesionesClaseRepository,
  ],

  exports: [
    SesionesClaseService,
  ],
})
export class SesionesClaseModule {}