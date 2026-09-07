import {
  Injectable,
} from '@nestjs/common';

import {
  BaseDatosService,
} from '../../base-datos/base-datos.service';

@Injectable()
export class EstudiantesRepository {
  constructor(
    private readonly baseDatosService:
      BaseDatosService,
  ) {}

  // =====================================
  // OBTENER TODOS
  // =====================================

  async obtenerTodos() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(`
        SELECT
          id,
          codigo_estudiante,
          nombres,
          apellidos,
          token_qr,
          activo,
          fecha_creacion,
          fecha_actualizacion

        FROM estudiantes

        ORDER BY
          apellidos,
          nombres
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
          codigo_estudiante,
          nombres,
          apellidos,
          token_qr,
          activo,
          fecha_creacion,
          fecha_actualizacion

        FROM estudiantes

        WHERE id = @id

        LIMIT 1
        `,
        {
          id,
        },
      );

    return (
      resultado.recordset[
        0
      ] ??
      null
    );
  }

  // =====================================
  // BUSCAR POR CODIGO
  // =====================================

  async buscarPorCodigo(
    codigo_estudiante:
      string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          codigo_estudiante,
          nombres,
          apellidos,
          activo

        FROM estudiantes

        WHERE codigo_estudiante =
          @codigo_estudiante

        LIMIT 1
        `,
        {
          codigo_estudiante,
        },
      );

    return (
      resultado.recordset[
        0
      ] ??
      null
    );
  }

  // =====================================
  // CREAR
  // =====================================

  async crear(
    codigo_estudiante:
      string,

    nombres:
      string,

    apellidos:
      string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO estudiantes (
          codigo_estudiante,
          nombres,
          apellidos
        )

        VALUES (
          @codigo_estudiante,
          @nombres,
          @apellidos
        )

        RETURNING
          id,
          codigo_estudiante,
          nombres,
          apellidos,
          token_qr,
          activo,
          fecha_creacion,
          fecha_actualizacion
        `,
        {
          codigo_estudiante,
          nombres,
          apellidos,
        },
      );

    return resultado.recordset[
      0
    ];
  }

  // =====================================
  // ACTUALIZAR
  // =====================================

  async actualizar(
    id:
      number,

    codigo_estudiante:
      string,

    nombres:
      string,

    apellidos:
      string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE estudiantes

        SET
          codigo_estudiante =
            @codigo_estudiante,

          nombres =
            @nombres,

          apellidos =
            @apellidos,

          fecha_actualizacion =
            CURRENT_TIMESTAMP

        WHERE id = @id

        RETURNING
          id,
          codigo_estudiante,
          nombres,
          apellidos,
          token_qr,
          activo,
          fecha_creacion,
          fecha_actualizacion
        `,
        {
          id,
          codigo_estudiante,
          nombres,
          apellidos,
        },
      );

    return (
      resultado.recordset[
        0
      ] ??
      null
    );
  }

  // =====================================
  // ACTIVAR / DESACTIVAR
  // =====================================

  async cambiarEstado(
    id:
      number,

    activo:
      boolean,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE estudiantes

        SET
          activo =
            @activo,

          fecha_actualizacion =
            CURRENT_TIMESTAMP

        WHERE id = @id

        RETURNING
          id,
          codigo_estudiante,
          nombres,
          apellidos,
          token_qr,
          activo,
          fecha_actualizacion
        `,
        {
          id,
          activo,
        },
      );

    return (
      resultado.recordset[
        0
      ] ??
      null
    );
  }
}