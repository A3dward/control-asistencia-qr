import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AsistenciasService } from './asistencias.service';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';

import { AutenticacionGuard } from '../autenticacion/guards/autenticacion.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';

import {
  UsuarioAutenticado,
} from '../autenticacion/interfaces/usuario-autenticado.interface';

@Controller('asistencias')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
export class AsistenciasController {
  constructor(
    private readonly asistenciasService:
      AsistenciasService,
  ) {}

  // =====================================
  // ESCANEAR QR
  // =====================================

  @Post('escanear')
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async escanear(
    @Body()
    datos: RegistrarAsistenciaDto,

    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },
  ) {
    const resultado =
      await this.asistenciasService.registrarPorQr(
        datos,
        request.usuario,
      );

    return {
      mensaje:
        'Asistencia registrada correctamente',
      datos:
        resultado,
    };
  }

  // =====================================
  // ASISTENCIAS SESION
  // =====================================

  @Get('sesion/:sesionId')
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async obtenerPorSesion(
    @Param(
      'sesionId',
      ParseIntPipe,
    )
    sesionId: number,

    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },
  ) {
    const asistencias =
      await this.asistenciasService.obtenerPorSesion(
        sesionId,
        request.usuario,
      );

    return {
      mensaje:
        'Asistencias de la sesion obtenidas correctamente',
      total:
        asistencias.length,
      datos:
        asistencias,
    };
  }

  // =====================================
  // RESUMEN
  // =====================================

  @Get('sesion/:sesionId/resumen')
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async obtenerResumen(
    @Param(
      'sesionId',
      ParseIntPipe,
    )
    sesionId: number,

    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },
  ) {
    const resultado =
      await this.asistenciasService.obtenerResumenSesion(
        sesionId,
        request.usuario,
      );

    return {
      mensaje:
        'Resumen de asistencia obtenido correctamente',
      datos:
        resultado,
    };
  }

  // =====================================
  // HISTORIAL DEL ESTUDIANTE
  // SOLO ADMIN
  // =====================================

  @Get('estudiante/:estudianteId')
  @Roles('ADMIN')
  async obtenerPorEstudiante(
    @Param(
      'estudianteId',
      ParseIntPipe,
    )
    estudianteId: number,
  ) {
    const asistencias =
      await this.asistenciasService.obtenerPorEstudiante(
        estudianteId,
      );

    return {
      mensaje:
        'Historial de asistencia obtenido correctamente',
      total:
        asistencias.length,
      datos:
        asistencias,
    };
  }
}