import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class SesionesClaseRepository {
  constructor(
    private readonly baseDatosService: BaseDatosService,
  ) {}

  // =====================================
  // OBTENER TODAS
  // =====================================

  async obtenerTodas() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(`
        SELECT
          sc.id,
          sc.asignacion_docente_id,
          sc.fecha_sesion,
          sc.hora_inicio,
          sc.hora_fin,
          sc.estado,
          sc.fecha_creacion,

          ad.docente_id,
          ad.curso_id,
          ad.seccion_id,

          d.codigo_docente,

          u.nombre_completo AS docente,

          c.codigo AS codigo_curso,
          c.nombre AS curso,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM sesiones_clase sc

        INNER JOIN asignaciones_docentes ad
          ON ad.id = sc.asignacion_docente_id

        INNER JOIN docentes d
          ON d.id = ad.docente_id

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        INNER JOIN cursos c
          ON c.id = ad.curso_id

        INNER JOIN secciones s
          ON s.id = ad.seccion_id

        ORDER BY
          sc.fecha_sesion DESC,
          sc.hora_inicio DESC
      `);

    return resultado.recordset;
  }

  // =====================================
  // BUSCAR POR ID
  // =====================================

  async buscarPorId(id: number) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          sc.id,
          sc.asignacion_docente_id,
          sc.fecha_sesion,
          sc.hora_inicio,
          sc.hora_fin,
          sc.estado,
          sc.fecha_creacion,

          ad.docente_id,
          ad.curso_id,
          ad.seccion_id,

          d.codigo_docente,

          u.nombre_completo AS docente,

          c.codigo AS codigo_curso,
          c.nombre AS curso,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM sesiones_clase sc

        INNER JOIN asignaciones_docentes ad
          ON ad.id = sc.asignacion_docente_id

        INNER JOIN docentes d
          ON d.id = ad.docente_id

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        INNER JOIN cursos c
          ON c.id = ad.curso_id

        INNER JOIN secciones s
          ON s.id = ad.seccion_id

        WHERE sc.id = @id
        `,
        {
          id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // BUSCAR ASIGNACION
  // =====================================

  async buscarAsignacionPorId(
    asignacion_docente_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          ad.id,
          ad.docente_id,
          ad.curso_id,
          ad.seccion_id,
          ad.activo,

          d.activo AS docente_activo,

          u.nombre_completo AS docente,
          u.activo AS usuario_activo,

          c.nombre AS curso,
          c.activo AS curso_activo,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico,
          s.activo AS seccion_activa

        FROM asignaciones_docentes ad

        INNER JOIN docentes d
          ON d.id = ad.docente_id

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        INNER JOIN cursos c
          ON c.id = ad.curso_id

        INNER JOIN secciones s
          ON s.id = ad.seccion_id

        WHERE ad.id = @asignacion_docente_id
        `,
        {
          asignacion_docente_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // BUSCAR SESION ABIERTA
  // =====================================

  async buscarSesionAbiertaPorAsignacion(
    asignacion_docente_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          asignacion_docente_id,
          fecha_sesion,
          hora_inicio,
          hora_fin,
          estado

        FROM sesiones_clase

        WHERE asignacion_docente_id =
          @asignacion_docente_id

          AND estado = 'ABIERTA'

        ORDER BY id DESC
        `,
        {
          asignacion_docente_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // CREAR
  // =====================================

  async crear(
    asignacion_docente_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO sesiones_clase (
          asignacion_docente_id,
          fecha_sesion,
          hora_inicio,
          estado
        )

        OUTPUT
          INSERTED.id,
          INSERTED.asignacion_docente_id,
          INSERTED.fecha_sesion,
          INSERTED.hora_inicio,
          INSERTED.hora_fin,
          INSERTED.estado,
          INSERTED.fecha_creacion

        VALUES (
          @asignacion_docente_id,
          CAST(GETDATE() AS DATE),
          CAST(GETDATE() AS TIME),
          'ABIERTA'
        )
        `,
        {
          asignacion_docente_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // OBTENER POR ASIGNACION
  // =====================================

  async obtenerPorAsignacion(
    asignacion_docente_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          sc.id,
          sc.asignacion_docente_id,
          sc.fecha_sesion,
          sc.hora_inicio,
          sc.hora_fin,
          sc.estado,
          sc.fecha_creacion

        FROM sesiones_clase sc

        WHERE sc.asignacion_docente_id =
          @asignacion_docente_id

        ORDER BY
          sc.fecha_sesion DESC,
          sc.hora_inicio DESC
        `,
        {
          asignacion_docente_id,
        },
      );

    return resultado.recordset;
  }

  // =====================================
  // CERRAR SESION
  // Y REGISTRAR AUSENTES
  // =====================================

  async cerrar(id: number) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        BEGIN TRY

          BEGIN TRANSACTION;

          /*
            Registrar como AUSENTE a todos los
            estudiantes activos de la seccion
            que no hayan sido registrados.
          */

          INSERT INTO asistencias (
            sesion_clase_id,
            estudiante_id,
            fecha_hora_asistencia,
            estado
          )

          SELECT
            sc.id,
            e.id,
            NULL,
            'AUSENTE'

          FROM sesiones_clase sc

          INNER JOIN asignaciones_docentes ad
            ON ad.id =
              sc.asignacion_docente_id

          INNER JOIN estudiantes_secciones es
            ON es.seccion_id =
              ad.seccion_id

          INNER JOIN estudiantes e
            ON e.id =
              es.estudiante_id

          WHERE sc.id = @id

            AND es.activo = 1

            AND e.activo = 1

            AND NOT EXISTS (
              SELECT 1
              FROM asistencias a
              WHERE
                a.sesion_clase_id = sc.id
                AND
                a.estudiante_id = e.id
            );

          /*
            Cerrar la sesion.
          */

          UPDATE sesiones_clase

          SET
            estado = 'CERRADA',
            hora_fin =
              CAST(GETDATE() AS TIME)

          WHERE id = @id;

          COMMIT TRANSACTION;

          SELECT
            id,
            asignacion_docente_id,
            fecha_sesion,
            hora_inicio,
            hora_fin,
            estado,
            fecha_creacion

          FROM sesiones_clase

          WHERE id = @id;

        END TRY

        BEGIN CATCH

          IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

          THROW;

        END CATCH
        `,
        {
          id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // CANCELAR
  // =====================================

  async cancelar(id: number) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE sesiones_clase

        SET
          estado = 'CANCELADA',
          hora_fin =
            CAST(GETDATE() AS TIME)

        OUTPUT
          INSERTED.id,
          INSERTED.asignacion_docente_id,
          INSERTED.fecha_sesion,
          INSERTED.hora_inicio,
          INSERTED.hora_fin,
          INSERTED.estado,
          INSERTED.fecha_creacion

        WHERE id = @id
        `,
        {
          id,
        },
      );

    return resultado.recordset[0] ?? null;
  }
}