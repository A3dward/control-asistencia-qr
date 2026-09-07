import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class AutenticacionRepository {
  constructor(
    private readonly baseDatosService: BaseDatosService,
  ) {}

  // =====================================
  // BUSCAR USUARIO POR CORREO
  // =====================================

  async buscarPorCorreo(
    correo: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          u.id AS usuario_id,
          u.nombre_completo,
          u.correo,
          u.contrasena_hash,
          u.activo AS usuario_activo,

          r.id AS rol_id,
          r.nombre AS rol,
          r.activo AS rol_activo,

          d.id AS docente_id,
          d.codigo_docente,
          d.activo AS docente_activo

        FROM usuarios u

        INNER JOIN roles r
          ON r.id = u.rol_id

        LEFT JOIN docentes d
          ON d.usuario_id = u.id

        WHERE u.correo = @correo
        `,
        {
          correo,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // BUSCAR USUARIO POR ID
  // =====================================

  async buscarPorId(
    usuario_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          u.id AS usuario_id,
          u.nombre_completo,
          u.correo,
          u.activo AS usuario_activo,
          u.fecha_creacion,

          r.id AS rol_id,
          r.nombre AS rol,
          r.activo AS rol_activo,

          d.id AS docente_id,
          d.codigo_docente,
          d.activo AS docente_activo

        FROM usuarios u

        INNER JOIN roles r
          ON r.id = u.rol_id

        LEFT JOIN docentes d
          ON d.usuario_id = u.id

        WHERE u.id = @usuario_id
        `,
        {
          usuario_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }
}