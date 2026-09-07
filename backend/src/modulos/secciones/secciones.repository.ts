import { Injectable } from '@nestjs/common';

import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class SeccionesRepository {
  constructor(
    private readonly baseDatosService:
      BaseDatosService,
  ) {}

  // =====================================
  // OBTENER TODAS
  // =====================================

  async obtenerTodas() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(`
        SELECT
          id,
          nombre,
          grado,
          anio_academico,
          activo,
          fecha_creacion
        FROM secciones
        ORDER BY
          anio_academico DESC,
          grado,
          nombre
      `);

    return resultado.recordset;
  }

  // =====================================
  // BUSCAR POR ID
  // =====================================

  async buscarPorId(
    id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          nombre,
          grado,
          anio_academico,
          activo,
          fecha_creacion
        FROM secciones
        WHERE id = @id
        LIMIT 1
        `,
        {
          id,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // BUSCAR POR DATOS
  // =====================================

  async buscarPorDatos(
    nombre: string,
    grado: string,
    anio_academico: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          nombre,
          grado,
          anio_academico,
          activo
        FROM secciones
        WHERE nombre = @nombre
          AND grado = @grado
          AND anio_academico = @anio_academico
        LIMIT 1
        `,
        {
          nombre,
          grado,
          anio_academico,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // CREAR
  // =====================================

  async crear(
    nombre: string,
    grado: string,
    anio_academico: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO secciones (
          nombre,
          grado,
          anio_academico
        )
        VALUES (
          @nombre,
          @grado,
          @anio_academico
        )
        RETURNING
          id,
          nombre,
          grado,
          anio_academico,
          activo,
          fecha_creacion
        `,
        {
          nombre,
          grado,
          anio_academico,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // ACTUALIZAR
  // =====================================

  async actualizar(
    id: number,
    nombre: string,
    grado: string,
    anio_academico: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE secciones
        SET
          nombre = @nombre,
          grado = @grado,
          anio_academico = @anio_academico
        WHERE id = @id
        RETURNING
          id,
          nombre,
          grado,
          anio_academico,
          activo,
          fecha_creacion
        `,
        {
          id,
          nombre,
          grado,
          anio_academico,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // ACTIVAR / DESACTIVAR
  // =====================================

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE secciones
        SET activo = @activo
        WHERE id = @id
        RETURNING
          id,
          nombre,
          grado,
          anio_academico,
          activo,
          fecha_creacion
        `,
        {
          id,
          activo,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }
}