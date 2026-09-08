import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CursosRepository,
} from './cursos.repository';

import {
  CrearCursoDto,
} from './dto/crear-curso.dto';

import {
  ActualizarCursoDto,
} from './dto/actualizar-curso.dto';

@Injectable()
export class CursosService {
  constructor(
    private readonly cursosRepository:
      CursosRepository,
  ) {}

  // =====================================
  // OBTENER TODOS
  // =====================================

  async obtenerTodos() {
    return this.cursosRepository.obtenerTodos();
  }

  // =====================================
  // OBTENER POR ID
  // =====================================

  async obtenerPorId(
    id: number,
  ) {
    const curso =
      await this.cursosRepository.buscarPorId(
        id,
      );

    if (!curso) {
      throw new NotFoundException(
        'El curso no existe.',
      );
    }

    return curso;
  }

  // =====================================
  // GENERAR CODIGO
  // =====================================

  private async generarCodigoAutomatico() {
    for (
      let intento = 0;
      intento < 20;
      intento++
    ) {
      const numero =
        Math.floor(
          100000 +
            Math.random() *
              900000,
        );

      const codigo =
        `CUR${numero}`;

      const existente =
        await this.cursosRepository.buscarPorCodigo(
          codigo,
        );

      if (!existente) {
        return codigo;
      }
    }

    throw new ConflictException(
      'No fue posible generar el codigo del curso.',
    );
  }

  // =====================================
  // CREAR
  // =====================================

  async crear(
    datos:
      CrearCursoDto,
  ) {
    const nombre =
      datos.nombre.trim();

    let codigo =
      datos.codigo
        ?.trim()
        .toUpperCase();

    if (!codigo) {
      codigo =
        await this.generarCodigoAutomatico();
    } else {
      const existente =
        await this.cursosRepository.buscarPorCodigo(
          codigo,
        );

      if (existente) {
        throw new ConflictException(
          'Ya existe un curso con ese codigo.',
        );
      }
    }

    return this.cursosRepository.crear(
      codigo,
      nombre,
    );
  }

  // =====================================
  // ACTUALIZAR
  // =====================================

  async actualizar(
    id: number,
    datos:
      ActualizarCursoDto,
  ) {
    const curso =
      await this.cursosRepository.buscarPorId(
        id,
      );

    if (!curso) {
      throw new NotFoundException(
        'El curso no existe.',
      );
    }

    const codigo =
      datos.codigo
        ?.trim()
        .toUpperCase() ??
      curso.codigo;

    const nombre =
      datos.nombre?.trim() ??
      curso.nombre;

    if (
      codigo !==
      curso.codigo
    ) {
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

  // =====================================
  // ACTIVAR / DESACTIVAR
  // =====================================

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const curso =
      await this.cursosRepository.buscarPorId(
        id,
      );

    if (!curso) {
      throw new NotFoundException(
        'El curso no existe.',
      );
    }

    if (
      Boolean(
        curso.activo,
      ) === activo
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