import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AsistenciasRepository } from './asistencias.repository';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';

import {
  UsuarioAutenticado,
} from '../autenticacion/interfaces/usuario-autenticado.interface';

@Injectable()
export class AsistenciasService {
  constructor(
    private readonly asistenciasRepository:
      AsistenciasRepository,
  ) {}

  // =====================================
  // VALIDAR ACCESO
  // =====================================

  private validarAcceso(
    docenteIdSesion: number,
    usuario: UsuarioAutenticado,
  ) {
    if (
      usuario.rol === 'ADMIN'
    ) {
      return;
    }

    if (
      usuario.rol !== 'DOCENTE' ||
      !usuario.docente_id
    ) {
      throw new ForbiddenException(
        'No tiene permisos para administrar esta asistencia.',
      );
    }

    if (
      Number(docenteIdSesion) !==
      Number(usuario.docente_id)
    ) {
      throw new ForbiddenException(
        'No puede administrar la asistencia de otro docente.',
      );
    }
  }

  // =====================================
  // REGISTRAR POR QR
  // =====================================

  async registrarPorQr(
    datos: RegistrarAsistenciaDto,
    usuario: UsuarioAutenticado,
  ) {
    const sesion =
      await this.asistenciasRepository.buscarSesionPorId(
        datos.sesion_clase_id,
      );

    if (!sesion) {
      throw new NotFoundException(
        'La sesion de clase no existe.',
      );
    }

    this.validarAcceso(
      sesion.docente_id,
      usuario,
    );

    if (
      sesion.estado !== 'ABIERTA'
    ) {
      throw new BadRequestException(
        'La sesion de clase no se encuentra abierta.',
      );
    }

    const contenido =
      datos.codigo_qr.trim();

    const prefijo =
      'ASISTENCIAQR:';

    if (
      !contenido.startsWith(
        prefijo,
      )
    ) {
      throw new BadRequestException(
        'El codigo QR no pertenece al sistema de asistencia.',
      );
    }

    const token =
      contenido.substring(
        prefijo.length,
      );

    const expresionUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      !expresionUuid.test(
        token,
      )
    ) {
      throw new BadRequestException(
        'El codigo QR tiene un formato invalido.',
      );
    }

    const estudiante =
      await this.asistenciasRepository.buscarEstudiantePorToken(
        token,
      );

    if (!estudiante) {
      throw new NotFoundException(
        'No se encontro un estudiante asociado al codigo QR.',
      );
    }

    if (!estudiante.activo) {
      throw new BadRequestException(
        'El estudiante se encuentra inactivo.',
      );
    }

    const inscripcion =
      await this.asistenciasRepository.buscarInscripcionActiva(
        estudiante.id,
        sesion.seccion_id,
      );

    if (!inscripcion) {
      throw new BadRequestException(
        'El estudiante no pertenece a la seccion de esta clase.',
      );
    }

    const asistenciaExistente =
      await this.asistenciasRepository.buscarAsistencia(
        datos.sesion_clase_id,
        estudiante.id,
      );

    if (asistenciaExistente) {
      throw new ConflictException(
        'La asistencia de este estudiante ya fue registrada.',
      );
    }

    const asistencia =
      await this.asistenciasRepository.registrarPresente(
        datos.sesion_clase_id,
        estudiante.id,
      );

    return {
      asistencia,

      estudiante: {
        id:
          estudiante.id,

        codigo_estudiante:
          estudiante.codigo_estudiante,

        nombres:
          estudiante.nombres,

        apellidos:
          estudiante.apellidos,
      },

      clase: {
        curso:
          sesion.curso,

        grado:
          sesion.grado,

        seccion:
          sesion.seccion,
      },
    };
  }

  // =====================================
  // POR SESION
  // =====================================

  async obtenerPorSesion(
    sesionId: number,
    usuario: UsuarioAutenticado,
  ) {
    const sesion =
      await this.asistenciasRepository.buscarSesionPorId(
        sesionId,
      );

    if (!sesion) {
      throw new NotFoundException(
        'La sesion de clase no existe.',
      );
    }

    this.validarAcceso(
      sesion.docente_id,
      usuario,
    );

    return this.asistenciasRepository.obtenerPorSesion(
      sesionId,
    );
  }

  // =====================================
  // RESUMEN
  // =====================================

  async obtenerResumenSesion(
    sesionId: number,
    usuario: UsuarioAutenticado,
  ) {
    const sesion =
      await this.asistenciasRepository.buscarSesionPorId(
        sesionId,
      );

    if (!sesion) {
      throw new NotFoundException(
        'La sesion de clase no existe.',
      );
    }

    this.validarAcceso(
      sesion.docente_id,
      usuario,
    );

    const resumen =
      await this.asistenciasRepository.obtenerResumenSesion(
        sesionId,
      );

    return {
      sesion: {
        id:
          sesion.id,

        fecha:
          sesion.fecha_sesion,

        estado:
          sesion.estado,

        curso:
          sesion.curso,

        grado:
          sesion.grado,

        seccion:
          sesion.seccion,
      },

      resumen,
    };
  }

  // =====================================
  // HISTORIAL ESTUDIANTE
  // ADMIN
  // =====================================

  async obtenerPorEstudiante(
    estudianteId: number,
  ) {
    const estudiante =
      await this.asistenciasRepository.buscarEstudiantePorId(
        estudianteId,
      );

    if (!estudiante) {
      throw new NotFoundException(
        'El estudiante no existe.',
      );
    }

    return this.asistenciasRepository.obtenerPorEstudiante(
      estudianteId,
    );
  }
}