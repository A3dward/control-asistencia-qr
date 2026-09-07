import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InscripcionesRepository } from './inscripciones.repository';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';

@Injectable()
export class InscripcionesService {
  constructor(
    private readonly inscripcionesRepository: InscripcionesRepository,
  ) {}

  async obtenerTodas() {
    return this.inscripcionesRepository.obtenerTodas();
  }

  async obtenerPorId(id: number) {
    const inscripcion =
      await this.inscripcionesRepository.buscarPorId(
        id,
      );

    if (!inscripcion) {
      throw new NotFoundException(
        'La inscripcion no existe.',
      );
    }

    return inscripcion;
  }

  async crear(
    datos: CrearInscripcionDto,
  ) {
    const estudiante =
      await this.inscripcionesRepository.buscarEstudiantePorId(
        datos.estudiante_id,
      );

    if (!estudiante) {
      throw new NotFoundException(
        'El estudiante no existe.',
      );
    }

    if (!estudiante.activo) {
      throw new BadRequestException(
        'No se puede inscribir un estudiante inactivo.',
      );
    }

    const seccion =
      await this.inscripcionesRepository.buscarSeccionPorId(
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

    const relacionExistente =
      await this.inscripcionesRepository.buscarRelacion(
        datos.estudiante_id,
        datos.seccion_id,
      );

    if (relacionExistente) {
      if (relacionExistente.activo) {
        throw new ConflictException(
          'El estudiante ya pertenece a esta seccion.',
        );
      }

      throw new ConflictException(
        'El estudiante ya estuvo inscrito en esta seccion. Puede reactivar la inscripcion existente.',
      );
    }

    const inscripcionActiva =
      await this.inscripcionesRepository.buscarInscripcionActivaPorAnio(
        datos.estudiante_id,
        seccion.anio_academico,
      );

    if (inscripcionActiva) {
      throw new ConflictException(
        `El estudiante ya tiene una seccion activa para el año ${seccion.anio_academico}.`,
      );
    }

    return this.inscripcionesRepository.crear(
      datos.estudiante_id,
      datos.seccion_id,
    );
  }

  async obtenerPorSeccion(
    seccionId: number,
  ) {
    const seccion =
      await this.inscripcionesRepository.buscarSeccionPorId(
        seccionId,
      );

    if (!seccion) {
      throw new NotFoundException(
        'La seccion no existe.',
      );
    }

    return this.inscripcionesRepository.obtenerPorSeccion(
      seccionId,
    );
  }

  async obtenerPorEstudiante(
    estudianteId: number,
  ) {
    const estudiante =
      await this.inscripcionesRepository.buscarEstudiantePorId(
        estudianteId,
      );

    if (!estudiante) {
      throw new NotFoundException(
        'El estudiante no existe.',
      );
    }

    return this.inscripcionesRepository.obtenerPorEstudiante(
      estudianteId,
    );
  }

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const inscripcion =
      await this.inscripcionesRepository.buscarPorId(
        id,
      );

    if (!inscripcion) {
      throw new NotFoundException(
        'La inscripcion no existe.',
      );
    }

    if (
      Boolean(inscripcion.activo) === activo
    ) {
      throw new BadRequestException(
        activo
          ? 'La inscripcion ya se encuentra activa.'
          : 'La inscripcion ya se encuentra inactiva.',
      );
    }

    if (activo) {
      if (!inscripcion.estudiante_activo) {
        throw new BadRequestException(
          'No se puede activar la inscripcion porque el estudiante se encuentra inactivo.',
        );
      }

      if (!inscripcion.seccion_activa) {
        throw new BadRequestException(
          'No se puede activar la inscripcion porque la seccion se encuentra inactiva.',
        );
      }

      const inscripcionActiva =
        await this.inscripcionesRepository.buscarInscripcionActivaPorAnio(
          inscripcion.estudiante_id,
          inscripcion.anio_academico,
        );

      if (
        inscripcionActiva &&
        inscripcionActiva.id !== id
      ) {
        throw new ConflictException(
          `El estudiante ya tiene otra seccion activa para el año ${inscripcion.anio_academico}.`,
        );
      }
    }

    return this.inscripcionesRepository.cambiarEstado(
      id,
      activo,
    );
  }
}