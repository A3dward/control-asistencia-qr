import { Module } from '@nestjs/common';

import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionesRepository } from './asignaciones.repository';

@Module({
  controllers: [
    AsignacionesController,
  ],

  providers: [
    AsignacionesService,
    AsignacionesRepository,
  ],

  exports: [
    AsignacionesService,
  ],
})
export class AsignacionesModule {}