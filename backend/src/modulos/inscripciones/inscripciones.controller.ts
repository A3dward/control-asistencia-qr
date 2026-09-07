import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { InscripcionesService } from './inscripciones.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';

import { AutenticacionGuard } from '../autenticacion/guards/autenticacion.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';

@Controller('inscripciones')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
@Roles('ADMIN')
export class InscripcionesController {
  constructor(
    private readonly inscripcionesService:
      InscripcionesService,
  ) {}

  @Get()
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

  @Post()
  async crear(
    @Body()
    datos: CrearInscripcionDto,
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

  @Get('seccion/:seccionId')
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

  @Get('estudiante/:estudianteId')
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