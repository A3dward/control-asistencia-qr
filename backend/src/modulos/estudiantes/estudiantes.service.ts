import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as QRCode from 'qrcode';

import { EstudiantesRepository } from './estudiantes.repository';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';

@Injectable()
export class EstudiantesService {
  constructor(
    private readonly estudiantesRepository: EstudiantesRepository,
  ) {}

  async obtenerTodos() {
    return this.estudiantesRepository.obtenerTodos();
  }

  async obtenerPorId(id: number) {
    const estudiante =
      await this.estudiantesRepository.buscarPorId(id);

    if (!estudiante) {
      throw new NotFoundException(
        'El estudiante no existe.',
      );
    }

    return estudiante;
  }

  async crear(
    datos: CrearEstudianteDto,
  ) {
    const codigo =
      datos.codigo_estudiante.trim();

    const nombres =
      datos.nombres.trim();

    const apellidos =
      datos.apellidos.trim();

    const estudianteExistente =
      await this.estudiantesRepository.buscarPorCodigo(
        codigo,
      );

    if (estudianteExistente) {
      throw new ConflictException(
        'Ya existe un estudiante con ese codigo.',
      );
    }

    return this.estudiantesRepository.crear(
      codigo,
      nombres,
      apellidos,
    );
  }

  async actualizar(
    id: number,
    datos: ActualizarEstudianteDto,
  ) {
    const estudiante =
      await this.estudiantesRepository.buscarPorId(id);

    if (!estudiante) {
      throw new NotFoundException(
        'El estudiante no existe.',
      );
    }

    const codigo =
      datos.codigo_estudiante?.trim() ??
      estudiante.codigo_estudiante;

    const nombres =
      datos.nombres?.trim() ??
      estudiante.nombres;

    const apellidos =
      datos.apellidos?.trim() ??
      estudiante.apellidos;

    if (
      codigo !==
      estudiante.codigo_estudiante
    ) {
      const codigoExistente =
        await this.estudiantesRepository.buscarPorCodigo(
          codigo,
        );

      if (codigoExistente) {
        throw new ConflictException(
          'Ya existe otro estudiante con ese codigo.',
        );
      }
    }

    return this.estudiantesRepository.actualizar(
      id,
      codigo,
      nombres,
      apellidos,
    );
  }

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const estudiante =
      await this.estudiantesRepository.buscarPorId(id);

    if (!estudiante) {
      throw new NotFoundException(
        'El estudiante no existe.',
      );
    }

    if (
      Boolean(estudiante.activo) === activo
    ) {
      throw new BadRequestException(
        activo
          ? 'El estudiante ya se encuentra activo.'
          : 'El estudiante ya se encuentra inactivo.',
      );
    }

    return this.estudiantesRepository.cambiarEstado(
      id,
      activo,
    );
  }

  async generarQr(id: number) {
    const estudiante =
      await this.estudiantesRepository.buscarPorId(id);

    if (!estudiante) {
      throw new NotFoundException(
        'El estudiante no existe.',
      );
    }

    if (!estudiante.activo) {
      throw new BadRequestException(
        'No se puede generar el QR de un estudiante inactivo.',
      );
    }

    const contenidoQr =
      `ASISTENCIAQR:${estudiante.token_qr}`;

    const imagenQr =
      await QRCode.toBuffer(
        contenidoQr,
        {
          type: 'png',
          width: 500,
          margin: 2,
          errorCorrectionLevel: 'M',
        },
      );

    return imagenQr;
  }
}