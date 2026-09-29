import {
  Module,
} from '@nestjs/common';

import {
  InscripcionesController,
} from './inscripciones.controller';

import {
  InscripcionesService,
} from './inscripciones.service';

import {
  InscripcionesRepository,
} from './inscripciones.repository';

import {
  AsignacionesModule,
} from '../asignaciones/asignaciones.module';

import {
  EstudiantesModule,
} from '../estudiantes/estudiantes.module';

@Module({
  imports: [
    AsignacionesModule,
    EstudiantesModule,
  ],

  controllers: [
    InscripcionesController,
  ],

  providers: [
    InscripcionesService,
    InscripcionesRepository,
  ],

  exports: [
    InscripcionesService,
  ],
})
export class InscripcionesModule {}