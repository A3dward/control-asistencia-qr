import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AsignacionesService } from './asignaciones.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';

import { AutenticacionGuard } from '../autenticacion/guards/autenticacion.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';

import {
  UsuarioAutenticado,
} from '../autenticacion/interfaces/usuario-autenticado.interface';

@Controller('asignaciones')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
export class AsignacionesController {
  constructor(
    private readonly asignacionesService:
      AsignacionesService,
  ) {}

  // =====================================
  // MIS ASIGNACIONES - DOCENTE
  // =====================================

  @Get('mis-asignaciones')
  @Roles('DOCENTE')
  async obtenerMisAsignaciones(
    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },
  ) {
    const docenteId =
      Number(
        request.usuario.docente_id,
      );

    const asignaciones =
      await this.asignacionesService.obtenerPorDocente(
        docenteId,
      );

    const activas =
      asignaciones.filter(
        (asignacion: any) =>
          Boolean(
            asignacion.activo,
          ),
      );

    return {
      mensaje:
        'Mis asignaciones obtenidas correctamente',
      total:
        activas.length,
      datos:
        activas,
    };
  }

  // =====================================
  // ADMIN - LISTAR TODAS
  // =====================================

  @Get()
  @Roles('ADMIN')
  async obtenerTodas() {
    const asignaciones =
      await this.asignacionesService.obtenerTodas();

    return {
      mensaje:
        'Asignaciones docentes obtenidas correctamente',
      total:
        asignaciones.length,
      datos:
        asignaciones,
    };
  }

  // =====================================
  // ADMIN - CREAR
  // =====================================

  @Post()
  @Roles('ADMIN')
  async crear(
    @Body()
    datos: CrearAsignacionDto,
  ) {
    const asignacion =
      await this.asignacionesService.crear(
        datos,
      );

    return {
      mensaje:
        'Asignacion docente registrada correctamente',
      datos:
        asignacion,
    };
  }

  // =====================================
  // ADMIN - POR DOCENTE
  // =====================================

  @Get('docente/:docenteId')
  @Roles('ADMIN')
  async obtenerPorDocente(
    @Param(
      'docenteId',
      ParseIntPipe,
    )
    docenteId: number,
  ) {
    const asignaciones =
      await this.asignacionesService.obtenerPorDocente(
        docenteId,
      );

    return {
      mensaje:
        'Asignaciones del docente obtenidas correctamente',
      total:
        asignaciones.length,
      datos:
        asignaciones,
    };
  }

  // =====================================
  // ADMIN - POR SECCION
  // =====================================

  @Get('seccion/:seccionId')
  @Roles('ADMIN')
  async obtenerPorSeccion(
    @Param(
      'seccionId',
      ParseIntPipe,
    )
    seccionId: number,
  ) {
    const asignaciones =
      await this.asignacionesService.obtenerPorSeccion(
        seccionId,
      );

    return {
      mensaje:
        'Asignaciones de la seccion obtenidas correctamente',
      total:
        asignaciones.length,
      datos:
        asignaciones,
    };
  }

  // =====================================
  // ADMIN - CONSULTAR ID
  // =====================================

  @Get(':id')
  @Roles('ADMIN')
  async obtenerPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const asignacion =
      await this.asignacionesService.obtenerPorId(
        id,
      );

    return {
      mensaje:
        'Asignacion docente obtenida correctamente',
      datos:
        asignacion,
    };
  }

  // =====================================
  // ADMIN - DESACTIVAR
  // =====================================

  @Patch(':id/desactivar')
  @Roles('ADMIN')
  async desactivar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const asignacion =
      await this.asignacionesService.cambiarEstado(
        id,
        false,
      );

    return {
      mensaje:
        'Asignacion docente desactivada correctamente',
      datos:
        asignacion,
    };
  }

  // =====================================
  // ADMIN - ACTIVAR
  // =====================================

  @Patch(':id/activar')
  @Roles('ADMIN')
  async activar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const asignacion =
      await this.asignacionesService.cambiarEstado(
        id,
        true,
      );

    return {
      mensaje:
        'Asignacion docente activada correctamente',
      datos:
        asignacion,
    };
  }
}