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

import {
  CursosService,
} from './cursos.service';

import {
  CrearCursoDto,
} from './dto/crear-curso.dto';

import {
  ActualizarCursoDto,
} from './dto/actualizar-curso.dto';

import {
  AutenticacionGuard,
} from '../autenticacion/guards/autenticacion.guard';

import {
  RolesGuard,
} from '../autenticacion/guards/roles.guard';

import {
  Roles,
} from '../autenticacion/decorators/roles.decorator';

@Controller('cursos')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
export class CursosController {
  constructor(
    private readonly cursosService:
      CursosService,
  ) {}

  @Get()
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async obtenerTodos() {
    const cursos =
      await this.cursosService.obtenerTodos();

    return {
      mensaje:
        'Cursos obtenidos correctamente',

      total:
        cursos.length,

      datos:
        cursos,
    };
  }

  @Post()
  @Roles('ADMIN')
  async crear(
    @Body()
    datos: CrearCursoDto,
  ) {
    const curso =
      await this.cursosService.crear(
        datos,
      );

    return {
      mensaje:
        'Curso registrado correctamente',

      datos:
        curso,
    };
  }

  @Get(':id')
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async obtenerPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const curso =
      await this.cursosService.obtenerPorId(
        id,
      );

    return {
      mensaje:
        'Curso obtenido correctamente',

      datos:
        curso,
    };
  }

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
      ActualizarCursoDto,
  ) {
    const curso =
      await this.cursosService.actualizar(
        id,
        datos,
      );

    return {
      mensaje:
        'Curso actualizado correctamente',

      datos:
        curso,
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
    const curso =
      await this.cursosService.cambiarEstado(
        id,
        false,
      );

    return {
      mensaje:
        'Curso desactivado correctamente',

      datos:
        curso,
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
    const curso =
      await this.cursosService.cambiarEstado(
        id,
        true,
      );

    return {
      mensaje:
        'Curso activado correctamente',

      datos:
        curso,
    };
  }
}