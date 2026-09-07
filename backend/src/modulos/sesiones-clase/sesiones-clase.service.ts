import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SesionesClaseRepository } from './sesiones-clase.repository';
import { CrearSesionClaseDto } from './dto/crear-sesion-clase.dto';

import {
  UsuarioAutenticado,
} from '../autenticacion/interfaces/usuario-autenticado.interface';

@Injectable()
export class SesionesClaseService {
  constructor(
    private readonly sesionesClaseRepository:
      SesionesClaseRepository,
  ) {}

  // =====================================
  // VALIDAR PROPIETARIO
  // =====================================

  private validarAcceso(
    docenteIdRecurso: number,
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
        'No tiene permisos para acceder a esta clase.',
      );
    }

    if (
      Number(docenteIdRecurso) !==
      Number(usuario.docente_id)
    ) {
      throw new ForbiddenException(
        'No puede administrar una clase asignada a otro docente.',
      );
    }
  }

  // =====================================
  // LISTAR TODAS - ADMIN
  // =====================================

  async obtenerTodas() {
    return this.sesionesClaseRepository.obtenerTodas();
  }

  // =====================================
  // CONSULTAR
  // =====================================

  async obtenerPorId(
    id: number,
    usuario: UsuarioAutenticado,
  ) {
    const sesion =
      await this.sesionesClaseRepository.buscarPorId(
        id,
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

    return sesion;
  }

  // =====================================
  // CREAR
  // =====================================

  async crear(
    datos: CrearSesionClaseDto,
    usuario: UsuarioAutenticado,
  ) {
    const asignacion =
      await this.sesionesClaseRepository.buscarAsignacionPorId(
        datos.asignacion_docente_id,
      );

    if (!asignacion) {
      throw new NotFoundException(
        'La asignacion docente no existe.',
      );
    }

    this.validarAcceso(
      asignacion.docente_id,
      usuario,
    );

    if (!asignacion.activo) {
      throw new BadRequestException(
        'No se puede iniciar una sesion con una asignacion inactiva.',
      );
    }

    if (
      !asignacion.docente_activo ||
      !asignacion.usuario_activo
    ) {
      throw new BadRequestException(
        'No se puede iniciar la sesion porque el docente se encuentra inactivo.',
      );
    }

    if (!asignacion.curso_activo) {
      throw new BadRequestException(
        'No se puede iniciar la sesion porque el curso se encuentra inactivo.',
      );
    }

    if (!asignacion.seccion_activa) {
      throw new BadRequestException(
        'No se puede iniciar la sesion porque la seccion se encuentra inactiva.',
      );
    }

    const sesionAbierta =
      await this.sesionesClaseRepository.buscarSesionAbiertaPorAsignacion(
        datos.asignacion_docente_id,
      );

    if (sesionAbierta) {
      throw new ConflictException(
        'Esta asignacion ya tiene una sesion de clase abierta.',
      );
    }

    return this.sesionesClaseRepository.crear(
      datos.asignacion_docente_id,
    );
  }

  // =====================================
  // POR ASIGNACION
  // =====================================

  async obtenerPorAsignacion(
    asignacionId: number,
    usuario: UsuarioAutenticado,
  ) {
    const asignacion =
      await this.sesionesClaseRepository.buscarAsignacionPorId(
        asignacionId,
      );

    if (!asignacion) {
      throw new NotFoundException(
        'La asignacion docente no existe.',
      );
    }

    this.validarAcceso(
      asignacion.docente_id,
      usuario,
    );

    return this.sesionesClaseRepository.obtenerPorAsignacion(
      asignacionId,
    );
  }

  // =====================================
  // CERRAR
  // =====================================

  async cerrar(
    id: number,
    usuario: UsuarioAutenticado,
  ) {
    const sesion =
      await this.sesionesClaseRepository.buscarPorId(
        id,
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
      sesion.estado === 'CERRADA'
    ) {
      throw new BadRequestException(
        'La sesion ya se encuentra cerrada.',
      );
    }

    if (
      sesion.estado === 'CANCELADA'
    ) {
      throw new BadRequestException(
        'No se puede cerrar una sesion cancelada.',
      );
    }

    return this.sesionesClaseRepository.cerrar(
      id,
    );
  }

  // =====================================
  // CANCELAR
  // =====================================

  async cancelar(
    id: number,
    usuario: UsuarioAutenticado,
  ) {
    const sesion =
      await this.sesionesClaseRepository.buscarPorId(
        id,
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
      sesion.estado === 'CERRADA'
    ) {
      throw new BadRequestException(
        'No se puede cancelar una sesion que ya fue cerrada.',
      );
    }

    if (
      sesion.estado === 'CANCELADA'
    ) {
      throw new BadRequestException(
        'La sesion ya se encuentra cancelada.',
      );
    }

    return this.sesionesClaseRepository.cancelar(
      id,
    );
  }
}