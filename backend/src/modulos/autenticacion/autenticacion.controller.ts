import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AutenticacionService } from './autenticacion.service';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { AutenticacionGuard } from './guards/autenticacion.guard';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(
    private readonly autenticacionService: AutenticacionService,
  ) {}

  // =====================================
  // LOGIN
  // =====================================

  @Post('login')
  async iniciarSesion(
    @Body()
    datos: IniciarSesionDto,
  ) {
    const resultado =
      await this.autenticacionService.iniciarSesion(
        datos,
      );

    return {
      mensaje:
        'Inicio de sesion correcto',
      datos: resultado,
    };
  }

  // =====================================
  // PERFIL DEL USUARIO AUTENTICADO
  // =====================================

  @Get('perfil')
  @UseGuards(AutenticacionGuard)
  async obtenerPerfil(
    @Req()
    request: any,
  ) {
    const usuarioId =
      Number(
        request.usuario.sub,
      );

    const perfil =
      await this.autenticacionService.obtenerPerfil(
        usuarioId,
      );

    return {
      mensaje:
        'Perfil obtenido correctamente',
      datos: perfil,
    };
  }
}