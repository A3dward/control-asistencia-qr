import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CursosRepository } from './cursos.repository';
import { CrearCursoDto } from './dto/crear-curso.dto';
import { ActualizarCursoDto } from './dto/actualizar-curso.dto';

@Injectable()
export class CursosService {
  constructor(
    private readonly cursosRepository: CursosRepository,
  ) {}

  async obtenerTodos() {
    return this.cursosRepository.obtenerTodos();
  }

  async obtenerPorId(id: number) {
    const curso =
      await this.cursosRepository.buscarPorId(id);

    if (!curso) {
      throw new NotFoundException(
        'El curso no existe.',
      );
    }

    return curso;
  }

  async crear(
    datos: CrearCursoDto,
  ) {
    const codigo =
      datos.codigo.trim().toUpperCase();

    const nombre =
      datos.nombre.trim();

    const existente =
      await this.cursosRepository.buscarPorCodigo(
        codigo,
      );

    if (existente) {
      throw new ConflictException(
        'Ya existe un curso con ese codigo.',
      );
    }

    return this.cursosRepository.crear(
      codigo,
      nombre,
    );
  }

  async actualizar(
    id: number,
    datos: ActualizarCursoDto,
  ) {
    const curso =
      await this.cursosRepository.buscarPorId(id);

    if (!curso) {
      throw new NotFoundException(
        'El curso no existe.',
      );
    }

    const codigo =
      datos.codigo?.trim().toUpperCase() ??
      curso.codigo;

    const nombre =
      datos.nombre?.trim() ??
      curso.nombre;

    if (codigo !== curso.codigo) {
      const existente =
        await this.cursosRepository.buscarPorCodigo(
          codigo,
        );

      if (existente) {
        throw new ConflictException(
          'Ya existe otro curso con ese codigo.',
        );
      }
    }

    return this.cursosRepository.actualizar(
      id,
      codigo,
      nombre,
    );
  }

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const curso =
      await this.cursosRepository.buscarPorId(id);

    if (!curso) {
      throw new NotFoundException(
        'El curso no existe.',
      );
    }

    if (
      Boolean(curso.activo) === activo
    ) {
      throw new BadRequestException(
        activo
          ? 'El curso ya se encuentra activo.'
          : 'El curso ya se encuentra inactivo.',
      );
    }

    return this.cursosRepository.cambiarEstado(
      id,
      activo,
    );
  }
}