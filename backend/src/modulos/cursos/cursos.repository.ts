import { Injectable } from '@nestjs/common';

import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class CursosRepository {
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
          codigo,
          nombre,
          activo,
          fecha_creacion
        FROM cursos
        ORDER BY nombre
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
          codigo,
          nombre,
          activo,
          fecha_creacion
        FROM cursos
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
  // BUSCAR POR CODIGO
  // =====================================

  async buscarPorCodigo(
    codigo: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          codigo,
          nombre,
          activo
        FROM cursos
        WHERE codigo = @codigo
        LIMIT 1
        `,
        {
          codigo,
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
    codigo: string,
    nombre: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO cursos (
          codigo,
          nombre
        )
        VALUES (
          @codigo,
          @nombre
        )
        RETURNING
          id,
          codigo,
          nombre,
          activo,
          fecha_creacion
        `,
        {
          codigo,
          nombre,
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
    codigo: string,
    nombre: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE cursos
        SET
          codigo = @codigo,
          nombre = @nombre
        WHERE id = @id
        RETURNING
          id,
          codigo,
          nombre,
          activo,
          fecha_creacion
        `,
        {
          id,
          codigo,
          nombre,
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
        UPDATE cursos
        SET activo = @activo
        WHERE id = @id
        RETURNING
          id,
          codigo,
          nombre,
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