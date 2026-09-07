import { Module } from '@nestjs/common';

import { SeccionesController } from './secciones.controller';
import { SeccionesService } from './secciones.service';
import { SeccionesRepository } from './secciones.repository';

@Module({
  controllers: [
    SeccionesController,
  ],

  providers: [
    SeccionesService,
    SeccionesRepository,
  ],

  exports: [
    SeccionesService,
  ],
})
export class SeccionesModule {}