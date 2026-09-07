import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class AsistenciasRepository {
  constructor(
    private readonly baseDatosService: BaseDatosService,
  ) {}

  // =====================================
  // BUSCAR SESION
  // =====================================

  async buscarSesionPorId(
    sesion_clase_id: number,
  ) {
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

          ad.seccion_id,
          ad.curso_id,
          ad.docente_id,

          c.nombre AS curso,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM sesiones_clase sc

        INNER JOIN asignaciones_docentes ad
          ON ad.id = sc.asignacion_docente_id

        INNER JOIN cursos c
          ON c.id = ad.curso_id

        INNER JOIN secciones s
          ON s.id = ad.seccion_id

        WHERE sc.id = @sesion_clase_id
        `,
        {
          sesion_clase_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // BUSCAR ESTUDIANTE POR TOKEN QR
  // =====================================

  async buscarEstudiantePorToken(
    token_qr: string,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          codigo_estudiante,
          nombres,
          apellidos,
          token_qr,
          activo

        FROM estudiantes

        WHERE token_qr = @token_qr
        `,
        {
          token_qr,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // VERIFICAR INSCRIPCION
  // =====================================

  async buscarInscripcionActiva(
    estudiante_id: number,
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          es.id,
          es.estudiante_id,
          es.seccion_id,
          es.fecha_inscripcion,
          es.activo

        FROM estudiantes_secciones es

        WHERE es.estudiante_id = @estudiante_id
          AND es.seccion_id = @seccion_id
          AND es.activo = 1
        `,
        {
          estudiante_id,
          seccion_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // BUSCAR ASISTENCIA EXISTENTE
  // =====================================

  async buscarAsistencia(
    sesion_clase_id: number,
    estudiante_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          sesion_clase_id,
          estudiante_id,
          fecha_hora_asistencia,
          estado,
          fecha_creacion

        FROM asistencias

        WHERE sesion_clase_id = @sesion_clase_id
          AND estudiante_id = @estudiante_id
        `,
        {
          sesion_clase_id,
          estudiante_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // REGISTRAR PRESENTE
  // =====================================

  async registrarPresente(
    sesion_clase_id: number,
    estudiante_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO asistencias (
          sesion_clase_id,
          estudiante_id,
          fecha_hora_asistencia,
          estado
        )

        OUTPUT
          INSERTED.id,
          INSERTED.sesion_clase_id,
          INSERTED.estudiante_id,
          INSERTED.fecha_hora_asistencia,
          INSERTED.estado,
          INSERTED.fecha_creacion

        VALUES (
          @sesion_clase_id,
          @estudiante_id,
          SYSDATETIME(),
          'PRESENTE'
        )
        `,
        {
          sesion_clase_id,
          estudiante_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  // =====================================
  // ASISTENCIAS POR SESION
  // =====================================

  async obtenerPorSesion(
    sesion_clase_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          a.id AS asistencia_id,
          a.sesion_clase_id,
          a.estudiante_id,
          a.fecha_hora_asistencia,
          a.estado,

          e.codigo_estudiante,
          e.nombres,
          e.apellidos

        FROM asistencias a

        INNER JOIN estudiantes e
          ON e.id = a.estudiante_id

        WHERE a.sesion_clase_id =
          @sesion_clase_id

        ORDER BY
          e.apellidos,
          e.nombres
        `,
        {
          sesion_clase_id,
        },
      );

    return resultado.recordset;
  }

  // =====================================
  // ASISTENCIAS DE ESTUDIANTE
  // =====================================

  async obtenerPorEstudiante(
    estudiante_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          a.id AS asistencia_id,
          a.estado,
          a.fecha_hora_asistencia,

          sc.id AS sesion_clase_id,
          sc.fecha_sesion,
          sc.hora_inicio,
          sc.hora_fin,

          c.codigo AS codigo_curso,
          c.nombre AS curso,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM asistencias a

        INNER JOIN sesiones_clase sc
          ON sc.id = a.sesion_clase_id

        INNER JOIN asignaciones_docentes ad
          ON ad.id = sc.asignacion_docente_id

        INNER JOIN cursos c
          ON c.id = ad.curso_id

        INNER JOIN secciones s
          ON s.id = ad.seccion_id

        WHERE a.estudiante_id =
          @estudiante_id

        ORDER BY
          sc.fecha_sesion DESC,
          sc.hora_inicio DESC
        `,
        {
          estudiante_id,
        },
      );

    return resultado.recordset;
  }

  // =====================================
  // RESUMEN DE UNA SESION
  // =====================================

  async obtenerResumenSesion(
    sesion_clase_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          COUNT(*) AS total_registros,

          SUM(
            CASE
              WHEN estado = 'PRESENTE'
              THEN 1
              ELSE 0
            END
          ) AS presentes,

          SUM(
            CASE
              WHEN estado = 'AUSENTE'
              THEN 1
              ELSE 0
            END
          ) AS ausentes,

          SUM(
            CASE
              WHEN estado = 'TARDE'
              THEN 1
              ELSE 0
            END
          ) AS tarde,

          SUM(
            CASE
              WHEN estado = 'JUSTIFICADO'
              THEN 1
              ELSE 0
            END
          ) AS justificados

        FROM asistencias

        WHERE sesion_clase_id =
          @sesion_clase_id
        `,
        {
          sesion_clase_id,
        },
      );

    return resultado.recordset[0];
  }

  // =====================================
  // BUSCAR ESTUDIANTE POR ID
  // =====================================

  async buscarEstudiantePorId(
    estudiante_id: number,
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

        WHERE id = @estudiante_id
        `,
        {
          estudiante_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }
}