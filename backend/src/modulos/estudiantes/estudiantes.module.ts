import { Module } from '@nestjs/common';

import { EstudiantesController } from './estudiantes.controller';
import { EstudiantesService } from './estudiantes.service';
import { EstudiantesRepository } from './estudiantes.repository';

@Module({
  controllers: [
    EstudiantesController,
  ],

  providers: [
    EstudiantesService,
    EstudiantesRepository,
  ],

  exports: [
    EstudiantesService,
  ],
})
export class EstudiantesModule {}