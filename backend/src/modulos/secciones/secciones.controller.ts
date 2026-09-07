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

import { SeccionesService } from './secciones.service';
import { CrearSeccionDto } from './dto/crear-seccion.dto';
import { ActualizarSeccionDto } from './dto/actualizar-seccion.dto';

import { AutenticacionGuard } from '../autenticacion/guards/autenticacion.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';

@Controller('secciones')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
@Roles('ADMIN')
export class SeccionesController {
  constructor(
    private readonly seccionesService:
      SeccionesService,
  ) {}

  @Get()
  async obtenerTodas() {
    const secciones =
      await this.seccionesService.obtenerTodas();

    return {
      mensaje:
        'Secciones obtenidas correctamente',
      total:
        secciones.length,
      datos:
        secciones,
    };
  }

  @Post()
  async crear(
    @Body()
    datos: CrearSeccionDto,
  ) {
    const seccion =
      await this.seccionesService.crear(
        datos,
      );

    return {
      mensaje:
        'Seccion registrada correctamente',
      datos:
        seccion,
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
    const seccion =
      await this.seccionesService.obtenerPorId(
        id,
      );

    return {
      mensaje:
        'Seccion obtenida correctamente',
      datos:
        seccion,
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
    datos: ActualizarSeccionDto,
  ) {
    const seccion =
      await this.seccionesService.actualizar(
        id,
        datos,
      );

    return {
      mensaje:
        'Seccion actualizada correctamente',
      datos:
        seccion,
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
    const seccion =
      await this.seccionesService.cambiarEstado(
        id,
        false,
      );

    return {
      mensaje:
        'Seccion desactivada correctamente',
      datos:
        seccion,
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
    const seccion =
      await this.seccionesService.cambiarEstado(
        id,
        true,
      );

    return {
      mensaje:
        'Seccion activada correctamente',
      datos:
        seccion,
    };
  }
}