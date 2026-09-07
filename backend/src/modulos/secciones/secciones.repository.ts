import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class SeccionesRepository {
  constructor(
    private readonly baseDatosService: BaseDatosService,
  ) {}

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

  async buscarPorId(id: number) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          nombre,
          grado,
          anio_academico,
          activo,
          fecha_creacion
        FROM secciones
        WHERE id = @id
        `,
        {
          id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async buscarPorDatos(
    nombre: string,
    grado: string,
    anio_academico: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          nombre,
          grado,
          anio_academico,
          activo
        FROM secciones
        WHERE nombre = @nombre
          AND grado = @grado
          AND anio_academico = @anio_academico
        `,
        {
          nombre,
          grado,
          anio_academico,
        },
      );

    return resultado.recordset[0] ?? null;
  }

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
        OUTPUT
          INSERTED.id,
          INSERTED.nombre,
          INSERTED.grado,
          INSERTED.anio_academico,
          INSERTED.activo,
          INSERTED.fecha_creacion
        VALUES (
          @nombre,
          @grado,
          @anio_academico
        )
        `,
        {
          nombre,
          grado,
          anio_academico,
        },
      );

    return resultado.recordset[0];
  }

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
        OUTPUT
          INSERTED.id,
          INSERTED.nombre,
          INSERTED.grado,
          INSERTED.anio_academico,
          INSERTED.activo,
          INSERTED.fecha_creacion
        WHERE id = @id
        `,
        {
          id,
          nombre,
          grado,
          anio_academico,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE secciones
        SET activo = @activo
        OUTPUT
          INSERTED.id,
          INSERTED.nombre,
          INSERTED.grado,
          INSERTED.anio_academico,
          INSERTED.activo,
          INSERTED.fecha_creacion
        WHERE id = @id
        `,
        {
          id,
          activo,
        },
      );

    return resultado.recordset[0] ?? null;
  }
}