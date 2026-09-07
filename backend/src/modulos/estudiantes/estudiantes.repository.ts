import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class EstudiantesRepository {
  constructor(
    private readonly baseDatosService: BaseDatosService,
  ) {}

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
        ORDER BY apellidos, nombres
      `);

    return resultado.recordset;
  }

  async buscarPorId(id: number) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
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
        `,
        {
          id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async buscarPorCodigo(
    codigo_estudiante: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          codigo_estudiante,
          nombres,
          apellidos,
          activo
        FROM estudiantes
        WHERE codigo_estudiante = @codigo_estudiante
        `,
        {
          codigo_estudiante,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async crear(
    codigo_estudiante: string,
    nombres: string,
    apellidos: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO estudiantes (
          codigo_estudiante,
          nombres,
          apellidos
        )
        OUTPUT
          INSERTED.id,
          INSERTED.codigo_estudiante,
          INSERTED.nombres,
          INSERTED.apellidos,
          INSERTED.token_qr,
          INSERTED.activo,
          INSERTED.fecha_creacion,
          INSERTED.fecha_actualizacion
        VALUES (
          @codigo_estudiante,
          @nombres,
          @apellidos
        )
        `,
        {
          codigo_estudiante,
          nombres,
          apellidos,
        },
      );

    return resultado.recordset[0];
  }

  async actualizar(
    id: number,
    codigo_estudiante: string,
    nombres: string,
    apellidos: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE estudiantes
        SET
          codigo_estudiante = @codigo_estudiante,
          nombres = @nombres,
          apellidos = @apellidos,
          fecha_actualizacion = SYSDATETIME()
        OUTPUT
          INSERTED.id,
          INSERTED.codigo_estudiante,
          INSERTED.nombres,
          INSERTED.apellidos,
          INSERTED.token_qr,
          INSERTED.activo,
          INSERTED.fecha_creacion,
          INSERTED.fecha_actualizacion
        WHERE id = @id
        `,
        {
          id,
          codigo_estudiante,
          nombres,
          apellidos,
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
        UPDATE estudiantes
        SET
          activo = @activo,
          fecha_actualizacion = SYSDATETIME()
        OUTPUT
          INSERTED.id,
          INSERTED.codigo_estudiante,
          INSERTED.nombres,
          INSERTED.apellidos,
          INSERTED.token_qr,
          INSERTED.activo,
          INSERTED.fecha_actualizacion
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