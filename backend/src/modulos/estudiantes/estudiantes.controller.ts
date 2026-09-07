import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';

import { EstudiantesService } from './estudiantes.service';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';

import { AutenticacionGuard } from '../autenticacion/guards/autenticacion.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';

@Controller('estudiantes')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
@Roles('ADMIN')
export class EstudiantesController {
  constructor(
    private readonly estudiantesService:
      EstudiantesService,
  ) {}

  @Get()
  async obtenerTodos() {
    const estudiantes =
      await this.estudiantesService.obtenerTodos();

    return {
      mensaje:
        'Estudiantes obtenidos correctamente',
      total:
        estudiantes.length,
      datos:
        estudiantes,
    };
  }

  @Post()
  async crear(
    @Body()
    datos: CrearEstudianteDto,
  ) {
    const estudiante =
      await this.estudiantesService.crear(
        datos,
      );

    return {
      mensaje:
        'Estudiante registrado correctamente',
      datos:
        estudiante,
    };
  }

  @Get(':id/qr')
  async obtenerQr(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const qr =
      await this.estudiantesService.generarQr(
        id,
      );

    return new StreamableFile(
      qr,
      {
        type:
          'image/png',

        disposition:
          `inline; filename="qr-estudiante-${id}.png"`,
      },
    );
  }

  @Get(':id')
  async obtenerPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const estudiante =
      await this.estudiantesService.obtenerPorId(
        id,
      );

    return {
      mensaje:
        'Estudiante obtenido correctamente',
      datos:
        estudiante,
    };
  }

  @Patch(':id')
  async actualizar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    datos: ActualizarEstudianteDto,
  ) {
    const estudiante =
      await this.estudiantesService.actualizar(
        id,
        datos,
      );

    return {
      mensaje:
        'Estudiante actualizado correctamente',
      datos:
        estudiante,
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
    const estudiante =
      await this.estudiantesService.cambiarEstado(
        id,
        false,
      );

    return {
      mensaje:
        'Estudiante desactivado correctamente',
      datos:
        estudiante,
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
    const estudiante =
      await this.estudiantesService.cambiarEstado(
        id,
        true,
      );

    return {
      mensaje:
        'Estudiante activado correctamente',
      datos:
        estudiante,
    };
  }
}