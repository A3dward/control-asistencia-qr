import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';

@Injectable()
export class AsignacionesRepository {
  constructor(
    private readonly baseDatosService: BaseDatosService,
  ) {}

  async obtenerTodas() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(`
        SELECT
          ad.id,
          ad.docente_id,
          ad.curso_id,
          ad.seccion_id,
          ad.activo,
          ad.fecha_creacion,

          d.codigo_docente,

          u.nombre_completo AS docente,
          u.correo,

          c.codigo AS codigo_curso,
          c.nombre AS curso,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM asignaciones_docentes ad

        INNER JOIN docentes d
          ON d.id = ad.docente_id

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        INNER JOIN cursos c
          ON c.id = ad.curso_id

        INNER JOIN secciones s
          ON s.id = ad.seccion_id

        ORDER BY
          s.anio_academico DESC,
          s.grado,
          s.nombre,
          c.nombre,
          u.nombre_completo
      `);

    return resultado.recordset;
  }

  async buscarPorId(id: number) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          ad.id,
          ad.docente_id,
          ad.curso_id,
          ad.seccion_id,
          ad.activo,
          ad.fecha_creacion,

          d.codigo_docente,
          d.activo AS docente_activo,

          u.nombre_completo AS docente,
          u.correo,
          u.activo AS usuario_activo,

          c.codigo AS codigo_curso,
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

        WHERE ad.id = @id
        `,
        {
          id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async buscarDocentePorId(
    docente_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          d.id,
          d.codigo_docente,
          d.activo,

          u.nombre_completo,
          u.correo,
          u.activo AS usuario_activo

        FROM docentes d

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        WHERE d.id = @docente_id
        `,
        {
          docente_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async buscarCursoPorId(
    curso_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          codigo,
          nombre,
          activo
        FROM cursos
        WHERE id = @curso_id
        `,
        {
          curso_id,
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

  async buscarAsignacion(
    docente_id: number,
    curso_id: number,
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT TOP 1
          id,
          docente_id,
          curso_id,
          seccion_id,
          activo,
          fecha_creacion
        FROM asignaciones_docentes
        WHERE docente_id = @docente_id
          AND curso_id = @curso_id
          AND seccion_id = @seccion_id
        `,
        {
          docente_id,
          curso_id,
          seccion_id,
        },
      );

    return resultado.recordset[0] ?? null;
  }

  async obtenerPorDocente(
    docente_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          ad.id AS asignacion_id,
          ad.activo,

          c.id AS curso_id,
          c.codigo AS codigo_curso,
          c.nombre AS curso,

          s.id AS seccion_id,
          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM asignaciones_docentes ad

        INNER JOIN cursos c
          ON c.id = ad.curso_id

        INNER JOIN secciones s
          ON s.id = ad.seccion_id

        WHERE ad.docente_id = @docente_id

        ORDER BY
          s.anio_academico DESC,
          s.grado,
          s.nombre,
          c.nombre
        `,
        {
          docente_id,
        },
      );

    return resultado.recordset;
  }

  async obtenerPorSeccion(
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          ad.id AS asignacion_id,
          ad.activo,

          c.id AS curso_id,
          c.codigo AS codigo_curso,
          c.nombre AS curso,

          d.id AS docente_id,
          d.codigo_docente,

          u.nombre_completo AS docente

        FROM asignaciones_docentes ad

        INNER JOIN cursos c
          ON c.id = ad.curso_id

        INNER JOIN docentes d
          ON d.id = ad.docente_id

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        WHERE ad.seccion_id = @seccion_id

        ORDER BY
          c.nombre,
          u.nombre_completo
        `,
        {
          seccion_id,
        },
      );

    return resultado.recordset;
  }

  async crear(
    docente_id: number,
    curso_id: number,
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO asignaciones_docentes (
          docente_id,
          curso_id,
          seccion_id
        )
        OUTPUT
          INSERTED.id,
          INSERTED.docente_id,
          INSERTED.curso_id,
          INSERTED.seccion_id,
          INSERTED.activo,
          INSERTED.fecha_creacion
        VALUES (
          @docente_id,
          @curso_id,
          @seccion_id
        )
        `,
        {
          docente_id,
          curso_id,
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
        UPDATE asignaciones_docentes
        SET activo = @activo
        OUTPUT
          INSERTED.id,
          INSERTED.docente_id,
          INSERTED.curso_id,
          INSERTED.seccion_id,
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