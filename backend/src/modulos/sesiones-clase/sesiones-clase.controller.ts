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

import { SesionesClaseService } from './sesiones-clase.service';
import { CrearSesionClaseDto } from './dto/crear-sesion-clase.dto';

import { AutenticacionGuard } from '../autenticacion/guards/autenticacion.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';

import {
  UsuarioAutenticado,
} from '../autenticacion/interfaces/usuario-autenticado.interface';

@Controller('sesiones-clase')
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
export class SesionesClaseController {
  constructor(
    private readonly sesionesClaseService:
      SesionesClaseService,
  ) {}

  // =====================================
  // ADMIN - TODAS
  // =====================================

  @Get()
  @Roles('ADMIN')
  async obtenerTodas() {
    const sesiones =
      await this.sesionesClaseService.obtenerTodas();

    return {
      mensaje:
        'Sesiones de clase obtenidas correctamente',
      total:
        sesiones.length,
      datos:
        sesiones,
    };
  }

  // =====================================
  // CREAR
  // ADMIN O DOCENTE PROPIETARIO
  // =====================================

  @Post()
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async crear(
    @Body()
    datos: CrearSesionClaseDto,

    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },
  ) {
    const sesion =
      await this.sesionesClaseService.crear(
        datos,
        request.usuario,
      );

    return {
      mensaje:
        'Sesion de clase iniciada correctamente',
      datos:
        sesion,
    };
  }

  // =====================================
  // SESIONES DE ASIGNACION
  // =====================================

  @Get('asignacion/:asignacionId')
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async obtenerPorAsignacion(
    @Param(
      'asignacionId',
      ParseIntPipe,
    )
    asignacionId: number,

    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },
  ) {
    const sesiones =
      await this.sesionesClaseService.obtenerPorAsignacion(
        asignacionId,
        request.usuario,
      );

    return {
      mensaje:
        'Sesiones de la asignacion obtenidas correctamente',
      total:
        sesiones.length,
      datos:
        sesiones,
    };
  }

  // =====================================
  // CONSULTAR SESION
  // =====================================

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

    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },
  ) {
    const sesion =
      await this.sesionesClaseService.obtenerPorId(
        id,
        request.usuario,
      );

    return {
      mensaje:
        'Sesion de clase obtenida correctamente',
      datos:
        sesion,
    };
  }

  // =====================================
  // CERRAR
  // =====================================

  @Patch(':id/cerrar')
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async cerrar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },
  ) {
    const sesion =
      await this.sesionesClaseService.cerrar(
        id,
        request.usuario,
      );

    return {
      mensaje:
        'Sesion de clase cerrada correctamente',
      datos:
        sesion,
    };
  }

  // =====================================
  // CANCELAR
  // =====================================

  @Patch(':id/cancelar')
  @Roles(
    'ADMIN',
    'DOCENTE',
  )
  async cancelar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: {
      usuario: UsuarioAutenticado;
    },
  ) {
    const sesion =
      await this.sesionesClaseService.cancelar(
        id,
        request.usuario,
      );

    return {
      mensaje:
        'Sesion de clase cancelada correctamente',
      datos:
        sesion,
    };
  }
}