import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';

import { AutenticacionRepository } from './autenticacion.repository';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly autenticacionRepository: AutenticacionRepository,
    private readonly jwtService: JwtService,
  ) {}

  // =====================================
  // INICIAR SESION
  // =====================================

  async iniciarSesion(
    datos: IniciarSesionDto,
  ) {
    const correo =
      datos.correo
        .trim()
        .toLowerCase();

    const usuario =
      await this.autenticacionRepository.buscarPorCorreo(
        correo,
      );

    // Usamos un mensaje general para no revelar
    // si el correo existe o no.
    if (!usuario) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos.',
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

    // Si el usuario es docente,
    // también verificamos su registro docente.
    if (usuario.rol === 'DOCENTE') {
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

    // =====================================
    // COMPARAR CONTRASEÑA
    // =====================================

    const contrasenaCorrecta =
      await bcrypt.compare(
        datos.contrasena,
        usuario.contrasena_hash,
      );

    if (!contrasenaCorrecta) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos.',
      );
    }

    // =====================================
    // DATOS QUE GUARDA EL TOKEN
    // =====================================

    const payload = {
      sub: Number(usuario.usuario_id),

      correo:
        usuario.correo,

      rol:
        usuario.rol,

      docente_id:
        usuario.docente_id
          ? Number(usuario.docente_id)
          : null,
    };

    // =====================================
    // GENERAR JWT
    // =====================================

    const access_token =
      await this.jwtService.signAsync(
        payload,
      );

    // =====================================
    // RESPUESTA
    // =====================================

    return {
      access_token,

      tipo_token: 'Bearer',

      usuario: {
        id:
          Number(usuario.usuario_id),

        nombre_completo:
          usuario.nombre_completo,

        correo:
          usuario.correo,

        rol:
          usuario.rol,

        docente_id:
          usuario.docente_id
            ? Number(usuario.docente_id)
            : null,

        codigo_docente:
          usuario.codigo_docente ?? null,
      },
    };
  }

  // =====================================
  // PERFIL DEL USUARIO
  // =====================================

  async obtenerPerfil(
    usuarioId: number,
  ) {
    const usuario =
      await this.autenticacionRepository.buscarPorId(
        usuarioId,
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
      usuario.rol === 'DOCENTE' &&
      !usuario.docente_activo
    ) {
      throw new UnauthorizedException(
        'El docente se encuentra inactivo.',
      );
    }

    return {
      id:
        Number(usuario.usuario_id),

      nombre_completo:
        usuario.nombre_completo,

      correo:
        usuario.correo,

      rol:
        usuario.rol,

      docente_id:
        usuario.docente_id
          ? Number(usuario.docente_id)
          : null,

      codigo_docente:
        usuario.codigo_docente ?? null,

      fecha_creacion:
        usuario.fecha_creacion,
    };
  }
}