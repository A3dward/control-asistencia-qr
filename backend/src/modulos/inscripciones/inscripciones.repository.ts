import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class InscripcionesRepository {
  constructor(
    private readonly baseDatosService: BaseDatosService,
  ) {}

  async obtenerTodas() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(`
        SELECT
          es.id,
          es.estudiante_id,
          es.seccion_id,
          es.fecha_inscripcion,
          es.activo,

          e.codigo_estudiante,
          e.nombres,
          e.apellidos,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM estudiantes_secciones es

        INNER JOIN estudiantes e
          ON e.id = es.estudiante_id

        INNER JOIN secciones s
          ON s.id = es.seccion_id

        ORDER BY
          s.anio_academico DESC,
          s.grado,
          s.nombre,
          e.apellidos,
          e.nombres
      `);

    return resultado.recordset;
  }

  async buscarPorId(id: number) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          es.id,
          es.estudiante_id,
          es.seccion_id,
          es.fecha_inscripcion,
          es.activo,

          e.codigo_estudiante,
          e.nombres,
          e.apellidos,
          e.activo AS estudiante_activo,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico,
          s.activo AS seccion_activa

        FROM estudiantes_secciones es

        INNER JOIN estudiantes e
          ON e.id = es.estudiante_id

        INNER JOIN secciones s
          ON s.id = es.seccion_id

        WHERE es.id = @id
        `,
        {
          id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

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

  async buscarSeccionPorId(
    seccion_id: number,
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
        WHERE id = @seccion_id
        `,
        {
          seccion_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async buscarRelacion(
    estudiante_id: number,
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          estudiante_id,
          seccion_id,
          fecha_inscripcion,
          activo
        FROM estudiantes_secciones
        WHERE estudiante_id = @estudiante_id
          AND seccion_id = @seccion_id
        `,
        {
          estudiante_id,
          seccion_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async buscarInscripcionActivaPorAnio(
    estudiante_id: number,
    anio_academico: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          es.id,
          es.estudiante_id,
          es.seccion_id,
          es.activo,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM estudiantes_secciones es

        INNER JOIN secciones s
          ON s.id = es.seccion_id

        WHERE es.estudiante_id = @estudiante_id
          AND s.anio_academico = @anio_academico
          AND es.activo = 1
        `,
        {
          estudiante_id,
          anio_academico,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async obtenerPorSeccion(
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          es.id AS inscripcion_id,
          es.fecha_inscripcion,
          es.activo,

          e.id AS estudiante_id,
          e.codigo_estudiante,
          e.nombres,
          e.apellidos,
          e.activo AS estudiante_activo

        FROM estudiantes_secciones es

        INNER JOIN estudiantes e
          ON e.id = es.estudiante_id

        WHERE es.seccion_id = @seccion_id

        ORDER BY
          e.apellidos,
          e.nombres
        `,
        {
          seccion_id,
        },
      );

    return resultado.recordset;
  }

  async obtenerPorEstudiante(
    estudiante_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          es.id AS inscripcion_id,
          es.fecha_inscripcion,
          es.activo,

          s.id AS seccion_id,
          s.nombre AS seccion,
          s.grado,
          s.anio_academico,
          s.activo AS seccion_activa

        FROM estudiantes_secciones es

        INNER JOIN secciones s
          ON s.id = es.seccion_id

        WHERE es.estudiante_id = @estudiante_id

        ORDER BY
          s.anio_academico DESC,
          s.grado,
          s.nombre
        `,
        {
          estudiante_id,
        },
      );

    return resultado.recordset;
  }

  async crear(
    estudiante_id: number,
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO estudiantes_secciones (
          estudiante_id,
          seccion_id
        )
        OUTPUT
          INSERTED.id,
          INSERTED.estudiante_id,
          INSERTED.seccion_id,
          INSERTED.fecha_inscripcion,
          INSERTED.activo
        VALUES (
          @estudiante_id,
          @seccion_id
        )
        `,
        {
          estudiante_id,
          seccion_id,
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
        UPDATE estudiantes_secciones
        SET activo = @activo
        OUTPUT
          INSERTED.id,
          INSERTED.estudiante_id,
          INSERTED.seccion_id,
          INSERTED.fecha_inscripcion,
          INSERTED.activo
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