import { Injectable } from '@nestjs/common';

import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class DocentesRepository {
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

        ORDER BY
          u.nombre_completo
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
    codigo_docente: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          codigo_docente,
          usuario_id,
          activo

        FROM docentes

        WHERE codigo_docente =
          @codigo_docente

        LIMIT 1
        `,
        {
          codigo_docente,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // BUSCAR USUARIO POR CORREO
  // =====================================

  async buscarUsuarioPorCorreo(
    correo: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          correo,
          nombre_completo,
          activo

        FROM usuarios

        WHERE correo = @correo

        LIMIT 1
        `,
        {
          correo,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // OBTENER ROL DOCENTE
  // =====================================

  async obtenerRolDocente() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          nombre

        FROM roles

        WHERE nombre = 'DOCENTE'
          AND activo = TRUE

        LIMIT 1
        `,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // CREAR DOCENTE
  // =====================================

  async crear(
    nombre_completo: string,
    correo: string,
    contrasena_hash: string,
    codigo_docente: string,
    rol_id: number,
  ) {
    return this.baseDatosService.ejecutarTransaccion(
      async (cliente) => {

        // =================================
        // CREAR USUARIO
        // =================================

        const resultadoUsuario =
          await this.baseDatosService.ejecutarConsulta(
            `
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
            )
            RETURNING
              id
            `,
            {
              nombre_completo,
              correo,
              contrasena_hash,
              rol_id,
            },
            cliente,
          );

        const usuario =
          resultadoUsuario.recordset[0];

        if (!usuario) {
          throw new Error(
            'No fue posible crear el usuario del docente.',
          );
        }

        const usuario_id =
          usuario.id;

        // =================================
        // CREAR DOCENTE
        // =================================

        const resultadoDocente =
          await this.baseDatosService.ejecutarConsulta(
            `
            INSERT INTO docentes (
              usuario_id,
              codigo_docente
            )
            VALUES (
              @usuario_id,
              @codigo_docente
            )
            RETURNING
              id
            `,
            {
              usuario_id,
              codigo_docente,
            },
            cliente,
          );

        const docente =
          resultadoDocente.recordset[0];

        if (!docente) {
          throw new Error(
            'No fue posible crear el docente.',
          );
        }

        const docente_id =
          docente.id;

        // =================================
        // DEVOLVER DOCENTE COMPLETO
        // =================================

        const resultado =
          await this.baseDatosService.ejecutarConsulta(
            `
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

            WHERE d.id = @docente_id

            LIMIT 1
            `,
            {
              docente_id,
            },
            cliente,
          );

        return (
          resultado.recordset[0] ??
          null
        );
      },
    );
  }

  // =====================================
  // ACTUALIZAR DOCENTE
  // =====================================

  async actualizar(
    id: number,
    nombre_completo: string,
    correo: string,
    codigo_docente: string,
  ) {
    return this.baseDatosService.ejecutarTransaccion(
      async (cliente) => {

        // =================================
        // ACTUALIZAR USUARIO
        // =================================

        await this.baseDatosService.ejecutarConsulta(
          `
          UPDATE usuarios

          SET
            nombre_completo =
              @nombre_completo,

            correo =
              @correo,

            fecha_actualizacion =
              CURRENT_TIMESTAMP

          WHERE id = (
            SELECT usuario_id
            FROM docentes
            WHERE id = @id
          )
          `,
          {
            id,
            nombre_completo,
            correo,
          },
          cliente,
        );

        // =================================
        // ACTUALIZAR DOCENTE
        // =================================

        await this.baseDatosService.ejecutarConsulta(
          `
          UPDATE docentes

          SET
            codigo_docente =
              @codigo_docente

          WHERE id = @id
          `,
          {
            id,
            codigo_docente,
          },
          cliente,
        );

        // =================================
        // DEVOLVER DOCENTE
        // =================================

        const resultado =
          await this.baseDatosService.ejecutarConsulta(
            `
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

            WHERE d.id = @id

            LIMIT 1
            `,
            {
              id,
            },
            cliente,
          );

        return (
          resultado.recordset[0] ??
          null
        );
      },
    );
  }

  // =====================================
  // ACTIVAR / DESACTIVAR
  // =====================================

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    return this.baseDatosService.ejecutarTransaccion(
      async (cliente) => {

        // =================================
        // CAMBIAR ESTADO DOCENTE
        // =================================

        await this.baseDatosService.ejecutarConsulta(
          `
          UPDATE docentes

          SET activo = @activo

          WHERE id = @id
          `,
          {
            id,
            activo,
          },
          cliente,
        );

        // =================================
        // CAMBIAR ESTADO USUARIO
        // =================================

        await this.baseDatosService.ejecutarConsulta(
          `
          UPDATE usuarios

          SET
            activo = @activo,

            fecha_actualizacion =
              CURRENT_TIMESTAMP

          WHERE id = (
            SELECT usuario_id
            FROM docentes
            WHERE id = @id
          )
          `,
          {
            id,
            activo,
          },
          cliente,
        );

        // =================================
        // DEVOLVER DOCENTE
        // =================================

        const resultado =
          await this.baseDatosService.ejecutarConsulta(
            `
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

            WHERE d.id = @id

            LIMIT 1
            `,
            {
              id,
            },
            cliente,
          );

        return (
          resultado.recordset[0] ??
          null
        );
      },
    );
  }
}