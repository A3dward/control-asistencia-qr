import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SeccionesRepository } from './secciones.repository';
import { CrearSeccionDto } from './dto/crear-seccion.dto';
import { ActualizarSeccionDto } from './dto/actualizar-seccion.dto';

@Injectable()
export class SeccionesService {
  constructor(
    private readonly seccionesRepository: SeccionesRepository,
  ) {}

  async obtenerTodas() {
    return this.seccionesRepository.obtenerTodas();
  }

  async obtenerPorId(id: number) {
    const seccion =
      await this.seccionesRepository.buscarPorId(id);

    if (!seccion) {
      throw new NotFoundException(
        'La seccion no existe.',
      );
    }

    return seccion;
  }

  async crear(
    datos: CrearSeccionDto,
  ) {
    const nombre = datos.nombre.trim();
    const grado = datos.grado.trim();

    const existente =
      await this.seccionesRepository.buscarPorDatos(
        nombre,
        grado,
        datos.anio_academico,
      );

    if (existente) {
      throw new ConflictException(
        'Ya existe una seccion con esos datos para el mismo año academico.',
      );
    }

    return this.seccionesRepository.crear(
      nombre,
      grado,
      datos.anio_academico,
    );
  }

  async actualizar(
    id: number,
    datos: ActualizarSeccionDto,
  ) {
    const seccion =
      await this.seccionesRepository.buscarPorId(id);

    if (!seccion) {
      throw new NotFoundException(
        'La seccion no existe.',
      );
    }

    const nombre =
      datos.nombre?.trim() ??
      seccion.nombre;

    const grado =
      datos.grado?.trim() ??
      seccion.grado;

    const anio_academico =
      datos.anio_academico ??
      seccion.anio_academico;

    const existente =
      await this.seccionesRepository.buscarPorDatos(
        nombre,
        grado,
        anio_academico,
      );

    if (
      existente &&
      existente.id !== id
    ) {
      throw new ConflictException(
        'Ya existe otra seccion con esos datos para el mismo año academico.',
      );
    }

    return this.seccionesRepository.actualizar(
      id,
      nombre,
      grado,
      anio_academico,
    );
  }

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const seccion =
      await this.seccionesRepository.buscarPorId(id);

    if (!seccion) {
      throw new NotFoundException(
        'La seccion no existe.',
      );
    }

    if (
      Boolean(seccion.activo) === activo
    ) {
      throw new BadRequestException(
        activo
          ? 'La seccion ya se encuentra activa.'
          : 'La seccion ya se encuentra inactiva.',
      );
    }

    return this.seccionesRepository.cambiarEstado(
      id,
      activo,
    );
  }
}