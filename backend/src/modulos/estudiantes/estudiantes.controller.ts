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

import {
  EstudiantesService,
} from './estudiantes.service';

import {
  CrearEstudianteDto,
} from './dto/crear-estudiante.dto';

import {
  ActualizarEstudianteDto,
} from './dto/actualizar-estudiante.dto';

import {
  AutenticacionGuard,
} from '../autenticacion/guards/autenticacion.guard';

import {
  RolesGuard,
} from '../autenticacion/guards/roles.guard';

import {
  Roles,
} from '../autenticacion/decorators/roles.decorator';

@Controller('estudiantes')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
export class EstudiantesController {
  constructor(
    private readonly estudiantesService:
      EstudiantesService,
  ) {}

  // =====================================
  // ADMIN - LISTAR TODOS
  // =====================================

  @Get()
  @Roles('ADMIN')
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

  // =====================================
  // ADMIN / DOCENTE - CREAR
  // =====================================

  @Post()
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async crear(
    @Body()
    datos:
      CrearEstudianteDto,
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

  // =====================================
  // ADMIN / DOCENTE - QR
  // =====================================

  @Get(':id/qr')
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
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

  // =====================================
  // ADMIN - CONSULTAR
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

  // =====================================
  // ADMIN - ACTUALIZAR
  // =====================================

  @Patch(':id')
  @Roles('ADMIN')
  async actualizar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    datos:
      ActualizarEstudianteDto,
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
  @Roles('ADMIN')
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
  @Roles('ADMIN')
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