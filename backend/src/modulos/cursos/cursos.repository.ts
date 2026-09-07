import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class CursosRepository {
  constructor(
    private readonly baseDatosService: BaseDatosService,
  ) {}

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

  async buscarPorId(id: number) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          codigo,
          nombre,
          activo,
          fecha_creacion
        FROM cursos
        WHERE id = @id
        `,
        {
          id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async buscarPorCodigo(codigo: string) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          codigo,
          nombre,
          activo
        FROM cursos
        WHERE codigo = @codigo
        `,
        {
          codigo,
        },
      );

    return resultado.recordset[0] ?? null;
  }

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
        OUTPUT
          INSERTED.id,
          INSERTED.codigo,
          INSERTED.nombre,
          INSERTED.activo,
          INSERTED.fecha_creacion
        VALUES (
          @codigo,
          @nombre
        )
        `,
        {
          codigo,
          nombre,
        },
      );

    return resultado.recordset[0];
  }

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
        OUTPUT
          INSERTED.id,
          INSERTED.codigo,
          INSERTED.nombre,
          INSERTED.activo,
          INSERTED.fecha_creacion
        WHERE id = @id
        `,
        {
          id,
          codigo,
          nombre,
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
        UPDATE cursos
        SET activo = @activo
        OUTPUT
          INSERTED.id,
          INSERTED.codigo,
          INSERTED.nombre,
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