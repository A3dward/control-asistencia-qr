import {
  Injectable,
} from '@nestjs/common';

import {
  BaseDatosService,
} from '../../base-datos/base-datos.service';

@Injectable()
export class AsignacionesRepository {
  constructor(
    private readonly baseDatosService:
      BaseDatosService,
  ) {}

  // =====================================
  // OBTENER TODAS
  // =====================================

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
  // BUSCAR DOCENTE
  // =====================================

  async buscarDocentePorId(
    docente_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
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

        LIMIT 1
        `,
        {
          docente_id,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // BUSCAR CURSO
  // =====================================

  async buscarCursoPorId(
    curso_id: number,
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

        WHERE id = @curso_id

        LIMIT 1
        `,
        {
          curso_id,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // BUSCAR SECCION
  // =====================================

  async buscarSeccionPorId(
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          nombre,
          grado,
          anio_academico,
          activo

        FROM secciones

        WHERE id = @seccion_id

        LIMIT 1
        `,
        {
          seccion_id,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // BUSCAR ASIGNACION EXACTA
  // =====================================

  async buscarAsignacion(
    docente_id: number,
    curso_id: number,
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
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

        LIMIT 1
        `,
        {
          docente_id,
          curso_id,
          seccion_id,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // VALIDAR CURSO EN OTRA CLASE
  // =====================================

  async buscarCursoEnOtraSeccion(
    curso_id: number,
    seccion_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          ad.id,
          ad.curso_id,
          ad.seccion_id,
          ad.activo,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM asignaciones_docentes ad

        INNER JOIN secciones s
          ON s.id = ad.seccion_id

        WHERE ad.curso_id = @curso_id
          AND ad.seccion_id <> @seccion_id

        LIMIT 1
        `,
        {
          curso_id,
          seccion_id,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // POR DOCENTE
  // =====================================

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

  // =====================================
  // POR SECCION
  // =====================================

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

  // =====================================
  // CREAR
  // =====================================

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

        VALUES (
          @docente_id,
          @curso_id,
          @seccion_id
        )

        RETURNING
          id,
          docente_id,
          curso_id,
          seccion_id,
          activo,
          fecha_creacion
        `,
        {
          docente_id,
          curso_id,
          seccion_id,
        },
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // ESTADO
  // =====================================

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE asignaciones_docentes

        SET activo = @activo

        WHERE id = @id

        RETURNING
          id,
          docente_id,
          curso_id,
          seccion_id,
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