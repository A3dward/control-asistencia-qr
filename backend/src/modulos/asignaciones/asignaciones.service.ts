import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AsignacionesRepository } from './asignaciones.repository';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';

@Injectable()
export class AsignacionesService {
  constructor(
    private readonly asignacionesRepository: AsignacionesRepository,
  ) {}

  async obtenerTodas() {
    return this.asignacionesRepository.obtenerTodas();
  }

  async obtenerPorId(id: number) {
    const asignacion =
      await this.asignacionesRepository.buscarPorId(id);

    if (!asignacion) {
      throw new NotFoundException(
        'La asignacion docente no existe.',
      );
    }

    return asignacion;
  }

  async crear(
    datos: CrearAsignacionDto,
  ) {
    // ============================
    // VALIDAR DOCENTE
    // ============================

    const docente =
      await this.asignacionesRepository.buscarDocentePorId(
        datos.docente_id,
      );

    if (!docente) {
      throw new NotFoundException(
        'El docente no existe.',
      );
    }

    if (
      !docente.activo ||
      !docente.usuario_activo
    ) {
      throw new BadRequestException(
        'No se puede asignar un docente inactivo.',
      );
    }

    // ============================
    // VALIDAR CURSO
    // ============================

    const curso =
      await this.asignacionesRepository.buscarCursoPorId(
        datos.curso_id,
      );

    if (!curso) {
      throw new NotFoundException(
        'El curso no existe.',
      );
    }

    if (!curso.activo) {
      throw new BadRequestException(
        'No se puede utilizar un curso inactivo.',
      );
    }

    // ============================
    // VALIDAR SECCION
    // ============================

    const seccion =
      await this.asignacionesRepository.buscarSeccionPorId(
        datos.seccion_id,
      );

    if (!seccion) {
      throw new NotFoundException(
        'La seccion no existe.',
      );
    }

    if (!seccion.activo) {
      throw new BadRequestException(
        'No se puede utilizar una seccion inactiva.',
      );
    }

    // ============================
    // VALIDAR DUPLICADO
    // ============================

    const asignacionExistente =
      await this.asignacionesRepository.buscarAsignacion(
        datos.docente_id,
        datos.curso_id,
        datos.seccion_id,
      );

    if (asignacionExistente) {
      if (asignacionExistente.activo) {
        throw new ConflictException(
          'Esta asignacion docente ya existe.',
        );
      }

      throw new ConflictException(
        'Esta asignacion ya existe pero se encuentra inactiva. Puede reactivarla.',
      );
    }

    return this.asignacionesRepository.crear(
      datos.docente_id,
      datos.curso_id,
      datos.seccion_id,
    );
  }

  async obtenerPorDocente(
    docenteId: number,
  ) {
    const docente =
      await this.asignacionesRepository.buscarDocentePorId(
        docenteId,
      );

    if (!docente) {
      throw new NotFoundException(
        'El docente no existe.',
      );
    }

    return this.asignacionesRepository.obtenerPorDocente(
      docenteId,
    );
  }

  async obtenerPorSeccion(
    seccionId: number,
  ) {
    const seccion =
      await this.asignacionesRepository.buscarSeccionPorId(
        seccionId,
      );

    if (!seccion) {
      throw new NotFoundException(
        'La seccion no existe.',
      );
    }

    return this.asignacionesRepository.obtenerPorSeccion(
      seccionId,
    );
  }

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const asignacion =
      await this.asignacionesRepository.buscarPorId(id);

    if (!asignacion) {
      throw new NotFoundException(
        'La asignacion docente no existe.',
      );
    }

    if (
      Boolean(asignacion.activo) === activo
    ) {
      throw new BadRequestException(
        activo
          ? 'La asignacion ya se encuentra activa.'
          : 'La asignacion ya se encuentra inactiva.',
      );
    }

    // Si se intenta reactivar, nuevamente
    // comprobamos todas las relaciones.

    if (activo) {
      if (
        !asignacion.docente_activo ||
        !asignacion.usuario_activo
      ) {
        throw new BadRequestException(
          'No se puede activar la asignacion porque el docente se encuentra inactivo.',
        );
      }

      if (!asignacion.curso_activo) {
        throw new BadRequestException(
          'No se puede activar la asignacion porque el curso se encuentra inactivo.',
        );
      }

      if (!asignacion.seccion_activa) {
        throw new BadRequestException(
          'No se puede activar la asignacion porque la seccion se encuentra inactiva.',
        );
      }
    }

    return this.asignacionesRepository.cambiarEstado(
      id,
      activo,
    );
  }
}