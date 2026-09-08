import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  AsignacionesRepository,
} from './asignaciones.repository';

import {
  CrearAsignacionDto,
} from './dto/crear-asignacion.dto';

@Injectable()
export class AsignacionesService {
  constructor(
    private readonly asignacionesRepository:
      AsignacionesRepository,
  ) {}

  async obtenerTodas() {
    return this.asignacionesRepository.obtenerTodas();
  }

  async obtenerPorId(
    id: number,
  ) {
    const asignacion =
      await this.asignacionesRepository.buscarPorId(
        id,
      );

    if (!asignacion) {
      throw new NotFoundException(
        'La asignacion no existe.',
      );
    }

    return asignacion;
  }

  // =====================================
  // CREAR ASIGNACION
  // =====================================

  async crear(
    datos:
      CrearAsignacionDto,
  ) {
    // =================================
    // DOCENTE
    // =================================

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
        'El docente se encuentra inactivo.',
      );
    }

    // =================================
    // CURSO
    // =================================

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
        'El curso se encuentra inactivo.',
      );
    }

    // =================================
    // CLASE
    // =================================

    const seccion =
      await this.asignacionesRepository.buscarSeccionPorId(
        datos.seccion_id,
      );

    if (!seccion) {
      throw new NotFoundException(
        'La clase no existe.',
      );
    }

    if (!seccion.activo) {
      throw new BadRequestException(
        'La clase se encuentra inactiva.',
      );
    }

    // =================================
    // UN CURSO NO PUEDE ESTAR
    // EN DOS CLASES
    // =================================

    const otraSeccion =
      await this.asignacionesRepository.buscarCursoEnOtraSeccion(
        datos.curso_id,
        datos.seccion_id,
      );

    if (otraSeccion) {
      throw new ConflictException(
        `Este curso ya pertenece a ${otraSeccion.grado} - ${otraSeccion.anio_academico}.`,
      );
    }

    // =================================
    // EVITAR DUPLICADO EXACTO
    // =================================

    const existente =
      await this.asignacionesRepository.buscarAsignacion(
        datos.docente_id,
        datos.curso_id,
        datos.seccion_id,
      );

    if (existente) {
      if (existente.activo) {
        throw new ConflictException(
          'Este curso ya esta agregado a esta clase.',
        );
      }

      throw new ConflictException(
        'Esta relacion ya existe pero se encuentra inactiva.',
      );
    }

    return this.asignacionesRepository.crear(
      datos.docente_id,
      datos.curso_id,
      datos.seccion_id,
    );
  }

  // =====================================
  // POR DOCENTE
  // =====================================

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

  // =====================================
  // POR SECCION
  // =====================================

  async obtenerPorSeccion(
    seccionId: number,
  ) {
    const seccion =
      await this.asignacionesRepository.buscarSeccionPorId(
        seccionId,
      );

    if (!seccion) {
      throw new NotFoundException(
        'La clase no existe.',
      );
    }

    return this.asignacionesRepository.obtenerPorSeccion(
      seccionId,
    );
  }

  // =====================================
  // ESTADO
  // =====================================

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const asignacion =
      await this.asignacionesRepository.buscarPorId(
        id,
      );

    if (!asignacion) {
      throw new NotFoundException(
        'La asignacion no existe.',
      );
    }

    if (
      Boolean(
        asignacion.activo,
      ) === activo
    ) {
      throw new BadRequestException(
        activo
          ? 'La asignacion ya esta activa.'
          : 'La asignacion ya esta inactiva.',
      );
    }

    if (activo) {
      if (
        !asignacion.docente_activo ||
        !asignacion.usuario_activo
      ) {
        throw new BadRequestException(
          'No se puede activar porque el docente esta inactivo.',
        );
      }

      if (
        !asignacion.curso_activo
      ) {
        throw new BadRequestException(
          'No se puede activar porque el curso esta inactivo.',
        );
      }

      if (
        !asignacion.seccion_activa
      ) {
        throw new BadRequestException(
          'No se puede activar porque la clase esta inactiva.',
        );
      }

      const otraSeccion =
        await this.asignacionesRepository.buscarCursoEnOtraSeccion(
          asignacion.curso_id,
          asignacion.seccion_id,
        );

      if (otraSeccion) {
        throw new ConflictException(
          'El curso ya se encuentra asociado a otra clase.',
        );
      }
    }

    return this.asignacionesRepository.cambiarEstado(
      id,
      activo,
    );
  }
}