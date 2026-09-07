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

import { DocentesService } from './docentes.service';
import { CrearDocenteDto } from './dto/crear-docente.dto';
import { ActualizarDocenteDto } from './dto/actualizar-docente.dto';

import { AutenticacionGuard } from '../autenticacion/guards/autenticacion.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';

@Controller('docentes')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
@Roles('ADMIN')
export class DocentesController {
  constructor(
    private readonly docentesService:
      DocentesService,
  ) {}

  @Get()
  async obtenerTodos() {
    const docentes =
      await this.docentesService.obtenerTodos();

    return {
      mensaje:
        'Docentes obtenidos correctamente',
      total:
        docentes.length,
      datos:
        docentes,
    };
  }

  @Post()
  async crear(
    @Body()
    datos: CrearDocenteDto,
  ) {
    const docente =
      await this.docentesService.crear(
        datos,
      );

    return {
      mensaje:
        'Docente registrado correctamente',
      datos:
        docente,
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
    const docente =
      await this.docentesService.obtenerPorId(
        id,
      );

    return {
      mensaje:
        'Docente obtenido correctamente',
      datos:
        docente,
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
    datos: ActualizarDocenteDto,
  ) {
    const docente =
      await this.docentesService.actualizar(
        id,
        datos,
      );

    return {
      mensaje:
        'Docente actualizado correctamente',
      datos:
        docente,
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
    const docente =
      await this.docentesService.cambiarEstado(
        id,
        false,
      );

    return {
      mensaje:
        'Docente desactivado correctamente',
      datos:
        docente,
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
    const docente =
      await this.docentesService.cambiarEstado(
        id,
        true,
      );

    return {
      mensaje:
        'Docente activado correctamente',
      datos:
        docente,
    };
  }
}