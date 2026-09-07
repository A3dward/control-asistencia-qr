import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  InscripcionesService,
} from './inscripciones.service';

import {
  CrearInscripcionDto,
} from './dto/crear-inscripcion.dto';

import {
  AsignacionesService,
} from '../asignaciones/asignaciones.service';

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

@Controller('inscripciones')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
export class InscripcionesController {
  constructor(
    private readonly inscripcionesService:
      InscripcionesService,

    private readonly asignacionesService:
      AsignacionesService,
  ) {}

  // =====================================
  // DOCENTE - INSCRIBIR EN MI SECCION
  // =====================================

  @Post('mi-seccion')
  @Roles('DOCENTE')
  async crearEnMiSeccion(
    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },

    @Body()
    datos:
      CrearInscripcionDto,
  ) {
    const docenteId =
      Number(
        request.usuario.docente_id,
      );

    if (
      !Number.isInteger(
        docenteId,
      ) ||
      docenteId <= 0
    ) {
      throw new ForbiddenException(
        'No se pudo identificar al docente.',
      );
    }

    const asignaciones =
      await this.asignacionesService.obtenerPorDocente(
        docenteId,
      );

    const tieneLaSeccion =
      asignaciones.some(
        (
          asignacion: any,
        ) =>
          Boolean(
            asignacion.activo,
          ) &&
          Number(
            asignacion.seccion_id,
          ) ===
            Number(
              datos.seccion_id,
            ),
      );

    if (!tieneLaSeccion) {
      throw new ForbiddenException(
        'No tiene permiso para registrar estudiantes en esta seccion.',
      );
    }

    const inscripcion =
      await this.inscripcionesService.crear(
        datos,
      );

    return {
      mensaje:
        'Estudiante registrado en su seccion correctamente',

      datos:
        inscripcion,
    };
  }

  // =====================================
  // ADMIN - TODAS
  // =====================================

  @Get()
  @Roles('ADMIN')
  async obtenerTodas() {
    const inscripciones =
      await this.inscripcionesService.obtenerTodas();

    return {
      mensaje:
        'Inscripciones obtenidas correctamente',

      total:
        inscripciones.length,

      datos:
        inscripciones,
    };
  }

  // =====================================
  // ADMIN - CREAR
  // =====================================

  @Post()
  @Roles('ADMIN')
  async crear(
    @Body()
    datos:
      CrearInscripcionDto,
  ) {
    const inscripcion =
      await this.inscripcionesService.crear(
        datos,
      );

    return {
      mensaje:
        'Estudiante asignado a la seccion correctamente',

      datos:
        inscripcion,
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
    const estudiantes =
      await this.inscripcionesService.obtenerPorSeccion(
        seccionId,
      );

    return {
      mensaje:
        'Estudiantes de la seccion obtenidos correctamente',

      total:
        estudiantes.length,

      datos:
        estudiantes,
    };
  }

  // =====================================
  // ADMIN - POR ESTUDIANTE
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
    const inscripciones =
      await this.inscripcionesService.obtenerPorEstudiante(
        estudianteId,
      );

    return {
      mensaje:
        'Inscripciones del estudiante obtenidas correctamente',

      total:
        inscripciones.length,

      datos:
        inscripciones,
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
    const inscripcion =
      await this.inscripcionesService.obtenerPorId(
        id,
      );

    return {
      mensaje:
        'Inscripcion obtenida correctamente',

      datos:
        inscripcion,
    };
  }

  @Patch(':id/desactivar')
  @Roles('ADMIN')
  async desactivar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const inscripcion =
      await this.inscripcionesService.cambiarEstado(
        id,
        false,
      );

    return {
      mensaje:
        'Inscripcion desactivada correctamente',

      datos:
        inscripcion,
    };
  }

  @Patch(':id/activar')
  @Roles('ADMIN')
  async activar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const inscripcion =
      await this.inscripcionesService.cambiarEstado(
        id,
        true,
      );

    return {
      mensaje:
        'Inscripcion activada correctamente',

      datos:
        inscripcion,
    };
  }
}