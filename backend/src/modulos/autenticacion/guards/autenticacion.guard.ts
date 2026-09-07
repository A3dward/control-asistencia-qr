import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { AutenticacionRepository } from '../autenticacion.repository';

import {
  UsuarioAutenticado,
} from '../interfaces/usuario-autenticado.interface';

@Injectable()
export class AutenticacionGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,

    private readonly autenticacionRepository:
      AutenticacionRepository,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context
        .switchToHttp()
        .getRequest();

    const authorization =
      request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'Token de autenticacion no proporcionado.',
      );
    }

    const [
      tipo,
      token,
    ] = authorization.split(' ');

    if (
      tipo !== 'Bearer' ||
      !token
    ) {
      throw new UnauthorizedException(
        'Formato de token incorrecto.',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<UsuarioAutenticado>(
          token,
        );

      const usuario =
        await this.autenticacionRepository.buscarPorId(
          Number(payload.sub),
        );

      if (!usuario) {
        throw new UnauthorizedException(
          'El usuario ya no existe.',
        );
      }

      if (!usuario.usuario_activo) {
        throw new UnauthorizedException(
          'El usuario se encuentra inactivo.',
        );
      }

      if (!usuario.rol_activo) {
        throw new UnauthorizedException(
          'El rol del usuario se encuentra inactivo.',
        );
      }

      if (
        usuario.rol === 'DOCENTE'
      ) {
        if (!usuario.docente_id) {
          throw new UnauthorizedException(
            'El usuario no tiene un docente asociado.',
          );
        }

        if (!usuario.docente_activo) {
          throw new UnauthorizedException(
            'El docente se encuentra inactivo.',
          );
        }
      }

      request.usuario = {
        sub:
          Number(usuario.usuario_id),

        correo:
          usuario.correo,

        rol:
          usuario.rol,

        docente_id:
          usuario.docente_id
            ? Number(usuario.docente_id)
            : null,

        iat:
          payload.iat,

        exp:
          payload.exp,
      };

      return true;
    } catch (error) {
      if (
        error instanceof
        UnauthorizedException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        'Token invalido o expirado.',
      );
    }
  }
}