import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class DocentesRepository {
  constructor(
    private readonly baseDatosService: BaseDatosService,
  ) {}

  async obtenerTodos() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(`
        SELECT
          d.id,
          d.codigo_docente,
          d.usuario_id,
          d.activo,
          d.fecha_creacion,

          u.nombre_completo,
          u.correo,

          r.nombre AS rol

        FROM docentes d

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        INNER JOIN roles r
          ON r.id = u.rol_id

        ORDER BY u.nombre_completo
      `);

    return resultado.recordset;
  }

  async buscarPorId(id: number) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          d.id,
          d.codigo_docente,
          d.usuario_id,
          d.activo,
          d.fecha_creacion,

          u.nombre_completo,
          u.correo,
          u.activo AS usuario_activo,

          r.nombre AS rol

        FROM docentes d

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        INNER JOIN roles r
          ON r.id = u.rol_id

        WHERE d.id = @id
        `,
        {
          id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async buscarPorCodigo(
    codigo_docente: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          codigo_docente,
          usuario_id,
          activo
        FROM docentes
        WHERE codigo_docente = @codigo_docente
        `,
        {
          codigo_docente,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async buscarUsuarioPorCorreo(
    correo: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          correo,
          nombre_completo,
          activo
        FROM usuarios
        WHERE correo = @correo
        `,
        {
          correo,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async obtenerRolDocente() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          nombre
        FROM roles
        WHERE nombre = 'DOCENTE'
          AND activo = 1
        `,
      );

    return resultado.recordset[0] ?? null;
  }

  async crear(
    nombre_completo: string,
    correo: string,
    contrasena_hash: string,
    codigo_docente: string,
    rol_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        BEGIN TRY

          BEGIN TRANSACTION;

          INSERT INTO usuarios (
            nombre_completo,
            correo,
            contrasena_hash,
            rol_id
          )
          VALUES (
            @nombre_completo,
            @correo,
            @contrasena_hash,
            @rol_id
          );

          DECLARE @usuario_id INT =
            CAST(SCOPE_IDENTITY() AS INT);

          INSERT INTO docentes (
            usuario_id,
            codigo_docente
          )
          VALUES (
            @usuario_id,
            @codigo_docente
          );

          DECLARE @docente_id INT =
            CAST(SCOPE_IDENTITY() AS INT);

          COMMIT TRANSACTION;

          SELECT
            d.id,
            d.codigo_docente,
            d.usuario_id,
            d.activo,
            d.fecha_creacion,

            u.nombre_completo,
            u.correo,

            r.nombre AS rol

          FROM docentes d

          INNER JOIN usuarios u
            ON u.id = d.usuario_id

          INNER JOIN roles r
            ON r.id = u.rol_id

          WHERE d.id = @docente_id;

        END TRY

        BEGIN CATCH

          IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

          THROW;

        END CATCH
        `,
        {
          nombre_completo,
          correo,
          contrasena_hash,
          codigo_docente,
          rol_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async actualizar(
    id: number,
    nombre_completo: string,
    correo: string,
    codigo_docente: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        BEGIN TRY

          BEGIN TRANSACTION;

          UPDATE usuarios
          SET
            nombre_completo = @nombre_completo,
            correo = @correo,
            fecha_actualizacion = SYSDATETIME()
          WHERE id = (
            SELECT usuario_id
            FROM docentes
            WHERE id = @id
          );

          UPDATE docentes
          SET
            codigo_docente = @codigo_docente
          WHERE id = @id;

          COMMIT TRANSACTION;

          SELECT
            d.id,
            d.codigo_docente,
            d.usuario_id,
            d.activo,
            d.fecha_creacion,

            u.nombre_completo,
            u.correo,

            r.nombre AS rol

          FROM docentes d

          INNER JOIN usuarios u
            ON u.id = d.usuario_id

          INNER JOIN roles r
            ON r.id = u.rol_id

          WHERE d.id = @id;

        END TRY

        BEGIN CATCH

          IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

          THROW;

        END CATCH
        `,
        {
          id,
          nombre_completo,
          correo,
          codigo_docente,
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
        BEGIN TRY

          BEGIN TRANSACTION;

          UPDATE docentes
          SET activo = @activo
          WHERE id = @id;

          UPDATE usuarios
          SET
            activo = @activo,
            fecha_actualizacion = SYSDATETIME()
          WHERE id = (
            SELECT usuario_id
            FROM docentes
            WHERE id = @id
          );

          COMMIT TRANSACTION;

          SELECT
            d.id,
            d.codigo_docente,
            d.usuario_id,
            d.activo,

            u.nombre_completo,
            u.correo,
            u.activo AS usuario_activo,

            r.nombre AS rol

          FROM docentes d

          INNER JOIN usuarios u
            ON u.id = d.usuario_id

          INNER JOIN roles r
            ON r.id = u.rol_id

          WHERE d.id = @id;

        END TRY

        BEGIN CATCH

          IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

          THROW;

        END CATCH
        `,
        {
          id,
          activo,
        },
      );

    return resultado.recordset[0] ?? null;
  }
}