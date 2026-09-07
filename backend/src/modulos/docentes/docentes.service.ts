import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { DocentesRepository } from './docentes.repository';
import { CrearDocenteDto } from './dto/crear-docente.dto';
import { ActualizarDocenteDto } from './dto/actualizar-docente.dto';

@Injectable()
export class DocentesService {
  constructor(
    private readonly docentesRepository: DocentesRepository,
  ) {}

  async obtenerTodos() {
    return this.docentesRepository.obtenerTodos();
  }

  async obtenerPorId(id: number) {
    const docente =
      await this.docentesRepository.buscarPorId(id);

    if (!docente) {
      throw new NotFoundException(
        'El docente no existe.',
      );
    }

    return docente;
  }

  async crear(
    datos: CrearDocenteDto,
  ) {
    const nombre_completo =
      datos.nombre_completo.trim();

    const correo =
      datos.correo.trim().toLowerCase();

    const codigo_docente =
      datos.codigo_docente
        .trim()
        .toUpperCase();

    const usuarioExistente =
      await this.docentesRepository.buscarUsuarioPorCorreo(
        correo,
      );

    if (usuarioExistente) {
      throw new ConflictException(
        'Ya existe un usuario con ese correo.',
      );
    }

    const codigoExistente =
      await this.docentesRepository.buscarPorCodigo(
        codigo_docente,
      );

    if (codigoExistente) {
      throw new ConflictException(
        'Ya existe un docente con ese codigo.',
      );
    }

    const rolDocente =
      await this.docentesRepository.obtenerRolDocente();

    if (!rolDocente) {
      throw new InternalServerErrorException(
        'No se encuentra configurado el rol DOCENTE.',
      );
    }

    const contrasena_hash =
      await bcrypt.hash(
        datos.contrasena,
        10,
      );

    return this.docentesRepository.crear(
      nombre_completo,
      correo,
      contrasena_hash,
      codigo_docente,
      rolDocente.id,
    );
  }

  async actualizar(
    id: number,
    datos: ActualizarDocenteDto,
  ) {
    const docente =
      await this.docentesRepository.buscarPorId(id);

    if (!docente) {
      throw new NotFoundException(
        'El docente no existe.',
      );
    }

    const nombre_completo =
      datos.nombre_completo?.trim() ??
      docente.nombre_completo;

    const correo =
      datos.correo
        ?.trim()
        .toLowerCase() ??
      docente.correo;

    const codigo_docente =
      datos.codigo_docente
        ?.trim()
        .toUpperCase() ??
      docente.codigo_docente;

    if (correo !== docente.correo) {
      const usuarioExistente =
        await this.docentesRepository.buscarUsuarioPorCorreo(
          correo,
        );

      if (
        usuarioExistente &&
        usuarioExistente.id !==
          docente.usuario_id
      ) {
        throw new ConflictException(
          'Ya existe otro usuario con ese correo.',
        );
      }
    }

    if (
      codigo_docente !==
      docente.codigo_docente
    ) {
      const codigoExistente =
        await this.docentesRepository.buscarPorCodigo(
          codigo_docente,
        );

      if (
        codigoExistente &&
        codigoExistente.id !== id
      ) {
        throw new ConflictException(
          'Ya existe otro docente con ese codigo.',
        );
      }
    }

    return this.docentesRepository.actualizar(
      id,
      nombre_completo,
      correo,
      codigo_docente,
    );
  }

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const docente =
      await this.docentesRepository.buscarPorId(id);

    if (!docente) {
      throw new NotFoundException(
        'El docente no existe.',
      );
    }

    if (
      Boolean(docente.activo) === activo
    ) {
      throw new BadRequestException(
        activo
          ? 'El docente ya se encuentra activo.'
          : 'El docente ya se encuentra inactivo.',
      );
    }

    return this.docentesRepository.cambiarEstado(
      id,
      activo,
    );
  }
}