import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  BaseDatosService,
} from './base-datos/base-datos.service';

import {
  AutenticacionGuard,
} from './modulos/autenticacion/guards/autenticacion.guard';

import {
  RolesGuard,
} from './modulos/autenticacion/guards/roles.guard';

import {
  Roles,
} from './modulos/autenticacion/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly baseDatosService:
      BaseDatosService,
  ) {}

  @Get()
  inicio() {
    return {
      mensaje:
        'API de Control de Asistencia funcionando',
    };
  }

  @Get('estado-bd')
  @UseGuards(
    AutenticacionGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  async estadoBaseDatos() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(`
        SELECT
          current_database()
            AS base_datos,

          current_user
            AS usuario_base_datos
      `);

    return {
      conexion:
        'Correcta',

      datos:
        resultado.recordset,
    };
  }
}