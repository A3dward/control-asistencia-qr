import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { BaseDatosModule } from './base-datos/base-datos.module';

import { EstudiantesModule } from './modulos/estudiantes/estudiantes.module';
import { SeccionesModule } from './modulos/secciones/secciones.module';
import { CursosModule } from './modulos/cursos/cursos.module';
import { DocentesModule } from './modulos/docentes/docentes.module';
import { InscripcionesModule } from './modulos/inscripciones/inscripciones.module';
import { AsignacionesModule } from './modulos/asignaciones/asignaciones.module';
import { SesionesClaseModule } from './modulos/sesiones-clase/sesiones-clase.module';
import { AsistenciasModule } from './modulos/asistencias/asistencias.module';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    BaseDatosModule,

    EstudiantesModule,

    SeccionesModule,

    CursosModule,

    DocentesModule,

    InscripcionesModule,

    AsignacionesModule,

    SesionesClaseModule,

    AsistenciasModule,

    AutenticacionModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}