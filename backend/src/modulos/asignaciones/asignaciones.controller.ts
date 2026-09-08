import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  AsignacionesService,
} from './asignaciones.service';

import {
  AutenticacionGuard,
} from '../autenticacion/guards/autenticacion.guard';

import {
  RolesGuard,
} from '../autenticacion/guards/roles.guard';

import {
  Roles,
} from '../autenticacion/decorators/roles.decorator';

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
  // DOCENTE
  //
  // Se conserva solamente porque
  // sesiones y asistencia siguen usando
  // internamente asignaciones_docentes.
  // =====================================

  @Get('mis-asignaciones')
  @Roles('DOCENTE')
  async obtenerMisAsignaciones(
    @Req()
    request: {
      usuario:
        UsuarioAutenticado;
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
        (
          asignacion: any,
        ) =>
          Boolean(
            asignacion.activo,
          ),
      );

    return {
      mensaje:
        'Asignaciones internas obtenidas correctamente',

      total:
        activas.length,

      datos:
        activas,
    };
  }

  // =====================================
  // ADMIN - CONSULTAS INTERNAS
  // =====================================

  @Get()
  @Roles('ADMIN')
  async obtenerTodas() {
    const datos =
      await this.asignacionesService.obtenerTodas();

    return {
      mensaje:
        'Asignaciones internas obtenidas correctamente',

      total:
        datos.length,

      datos,
    };
  }

  @Get(
    'docente/:docenteId',
  )
  @Roles('ADMIN')
  async obtenerPorDocente(
    @Param(
      'docenteId',
      ParseIntPipe,
    )
    docenteId: number,
  ) {
    const datos =
      await this.asignacionesService.obtenerPorDocente(
        docenteId,
      );

    return {
      mensaje:
        'Asignaciones internas del docente obtenidas correctamente',

      total:
        datos.length,

      datos,
    };
  }

  @Get(
    'seccion/:seccionId',
  )
  @Roles('ADMIN')
  async obtenerPorSeccion(
    @Param(
      'seccionId',
      ParseIntPipe,
    )
    seccionId: number,
  ) {
    const datos =
      await this.asignacionesService.obtenerPorSeccion(
        seccionId,
      );

    return {
      mensaje:
        'Asignaciones internas de la clase obtenidas correctamente',

      total:
        datos.length,

      datos,
    };
  }

  @Get(':id')
  @Roles('ADMIN')
  async obtenerPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const datos =
      await this.asignacionesService.obtenerPorId(
        id,
      );

    return {
      mensaje:
        'Asignacion interna obtenida correctamente',

      datos,
    };
  }
}