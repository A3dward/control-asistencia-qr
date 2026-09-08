import {
  Injectable,
} from '@nestjs/common';

import {
  PoolClient,
} from 'pg';

import {
  BaseDatosService,
} from '../../base-datos/base-datos.service';

@Injectable()
export class GestionClasesRepository {
  constructor(
    private readonly baseDatosService:
      BaseDatosService,
  ) {}

  // =====================================
  // DOCENTE
  // =====================================

  async buscarDocentePorId(
    docente_id: number,
    cliente?: PoolClient,
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
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // CLASE
  // =====================================

  async buscarSeccionPorId(
    seccion_id: number,
    cliente?: PoolClient,
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
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // CURSO
  // =====================================

  async buscarCursoPorId(
    curso_id: number,
    cliente?: PoolClient,
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
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // CURSO - CLASE POR ID
  // =====================================

  async buscarCursoClasePorId(
    id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          cs.id,
          cs.curso_id,
          cs.seccion_id,
          cs.activo,
          cs.fecha_creacion,

          c.codigo AS codigo_curso,
          c.nombre AS curso,
          c.activo AS curso_activo,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico,
          s.activo AS clase_activa

        FROM cursos_secciones cs

        INNER JOIN cursos c
          ON c.id = cs.curso_id

        INNER JOIN secciones s
          ON s.id = cs.seccion_id

        WHERE cs.id = @id

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
  }

  // =====================================
  // RELACION EXACTA CURSO - CLASE
  // =====================================

  async buscarCursoClaseExacta(
    curso_id: number,
    seccion_id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          curso_id,
          seccion_id,
          activo,
          fecha_creacion

        FROM cursos_secciones

        WHERE curso_id = @curso_id
          AND seccion_id = @seccion_id

        LIMIT 1
        `,
        {
          curso_id,
          seccion_id,
        },
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // CURSO YA UTILIZADO EN OTRA CLASE
  // =====================================

  async buscarCursoEnClaseActiva(
    curso_id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          cs.id,
          cs.curso_id,
          cs.seccion_id,
          cs.activo,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico

        FROM cursos_secciones cs

        INNER JOIN secciones s
          ON s.id = cs.seccion_id

        WHERE cs.curso_id = @curso_id
          AND cs.activo = TRUE

        LIMIT 1
        `,
        {
          curso_id,
        },
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // CREAR CURSO - CLASE
  // =====================================

  async crearCursoClase(
    curso_id: number,
    seccion_id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO cursos_secciones (
          curso_id,
          seccion_id
        )
        VALUES (
          @curso_id,
          @seccion_id
        )

        RETURNING
          id,
          curso_id,
          seccion_id,
          activo,
          fecha_creacion
        `,
        {
          curso_id,
          seccion_id,
        },
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // ESTADO CURSO - CLASE
  // =====================================

  async cambiarEstadoCursoClase(
    id: number,
    activo: boolean,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE cursos_secciones

        SET activo = @activo

        WHERE id = @id

        RETURNING
          id,
          curso_id,
          seccion_id,
          activo,
          fecha_creacion
        `,
        {
          id,
          activo,
        },
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // ADMIN - CONFIGURACION CURSOS/CLASES
  // =====================================

  async obtenerConfiguracionCursos() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          cs.id,
          cs.curso_id,
          cs.seccion_id,
          cs.activo,
          cs.fecha_creacion,

          c.codigo AS codigo_curso,
          c.nombre AS curso,
          c.activo AS curso_activo,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico,
          s.activo AS clase_activa

        FROM cursos_secciones cs

        INNER JOIN cursos c
          ON c.id = cs.curso_id

        INNER JOIN secciones s
          ON s.id = cs.seccion_id

        ORDER BY
          s.anio_academico DESC,
          s.grado,
          s.nombre,
          c.nombre
        `,
      );

    return resultado.recordset;
  }

  // =====================================
  // DOCENTE - CLASE
  // =====================================

  async buscarDocenteClase(
    docente_id: number,
    seccion_id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          docente_id,
          seccion_id,
          activo,
          fecha_creacion

        FROM docentes_secciones

        WHERE docente_id = @docente_id
          AND seccion_id = @seccion_id

        LIMIT 1
        `,
        {
          docente_id,
          seccion_id,
        },
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // DOCENTE - CLASE POR ID
  // =====================================

  async buscarDocenteClasePorId(
    id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          ds.id,
          ds.docente_id,
          ds.seccion_id,
          ds.activo,
          ds.fecha_creacion,

          d.codigo_docente,
          d.activo AS docente_activo,

          u.nombre_completo AS docente,
          u.correo,
          u.activo AS usuario_activo,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico,
          s.activo AS clase_activa

        FROM docentes_secciones ds

        INNER JOIN docentes d
          ON d.id = ds.docente_id

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        INNER JOIN secciones s
          ON s.id = ds.seccion_id

        WHERE ds.id = @id

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
  }

  // =====================================
  // CREAR DOCENTE - CLASE
  // =====================================

  async crearDocenteClase(
    docente_id: number,
    seccion_id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        INSERT INTO docentes_secciones (
          docente_id,
          seccion_id
        )
        VALUES (
          @docente_id,
          @seccion_id
        )

        RETURNING
          id,
          docente_id,
          seccion_id,
          activo,
          fecha_creacion
        `,
        {
          docente_id,
          seccion_id,
        },
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // ESTADO DOCENTE - CLASE
  // =====================================

  async cambiarEstadoDocenteClase(
    id: number,
    activo: boolean,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        UPDATE docentes_secciones

        SET activo = @activo

        WHERE id = @id

        RETURNING
          id,
          docente_id,
          seccion_id,
          activo,
          fecha_creacion
        `,
        {
          id,
          activo,
        },
        cliente,
      );

    return (
      resultado.recordset[0] ??
      null
    );
  }

  // =====================================
  // ADMIN - DOCENTES / CLASES
  // =====================================

  async obtenerDocentesClases() {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          ds.id,
          ds.docente_id,
          ds.seccion_id,
          ds.activo,
          ds.fecha_creacion,

          d.codigo_docente,
          d.activo AS docente_activo,

          u.nombre_completo AS docente,
          u.correo,
          u.activo AS usuario_activo,

          s.nombre AS seccion,
          s.grado,
          s.anio_academico,
          s.activo AS clase_activa

        FROM docentes_secciones ds

        INNER JOIN docentes d
          ON d.id = ds.docente_id

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        INNER JOIN secciones s
          ON s.id = ds.seccion_id

        ORDER BY
          s.anio_academico DESC,
          s.grado,
          s.nombre,
          u.nombre_completo
        `,
      );

    return resultado.recordset;
  }

  // =====================================
  // CURSOS ACTIVOS DE CLASE
  // =====================================

  async obtenerCursosActivosPorClase(
    seccion_id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          c.id,
          c.codigo,
          c.nombre

        FROM cursos_secciones cs

        INNER JOIN cursos c
          ON c.id = cs.curso_id

        WHERE cs.seccion_id = @seccion_id
          AND cs.activo = TRUE
          AND c.activo = TRUE

        ORDER BY
          c.nombre
        `,
        {
          seccion_id,
        },
        cliente,
      );

    return resultado.recordset;
  }

  // =====================================
  // DOCENTES ACTIVOS DE UNA CLASE
  // =====================================

  async obtenerDocentesActivosPorClase(
    seccion_id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          ds.docente_id

        FROM docentes_secciones ds

        INNER JOIN docentes d
          ON d.id = ds.docente_id

        INNER JOIN usuarios u
          ON u.id = d.usuario_id

        WHERE ds.seccion_id = @seccion_id
          AND ds.activo = TRUE
          AND d.activo = TRUE
          AND u.activo = TRUE
        `,
        {
          seccion_id,
        },
        cliente,
      );

    return resultado.recordset;
  }

  // =====================================
  // SINCRONIZAR ASIGNACION INTERNA
  // =====================================

  async sincronizarAsignacion(
    docente_id: number,
    curso_id: number,
    seccion_id: number,
    cliente?: PoolClient,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          id,
          activo

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
        cliente,
      );

    const asignacion =
      resultado.recordset[0];

    if (asignacion) {
      if (
        !Boolean(
          asignacion.activo,
        )
      ) {
        await this.baseDatosService.ejecutarConsulta(
          `
          UPDATE asignaciones_docentes

          SET activo = TRUE

          WHERE id = @id
          `,
          {
            id:
              asignacion.id,
          },
          cliente,
        );
      }

      return;
    }

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
      `,
      {
        docente_id,
        curso_id,
        seccion_id,
      },
      cliente,
    );
  }

  // =====================================
  // DESACTIVAR ASIGNACIONES DEL DOCENTE
  // PARA UNA CLASE
  // =====================================

  async desactivarAsignacionesDocenteClase(
    docente_id: number,
    seccion_id: number,
    cliente?: PoolClient,
  ) {
    await this.baseDatosService.ejecutarConsulta(
      `
      UPDATE asignaciones_docentes

      SET activo = FALSE

      WHERE docente_id = @docente_id
        AND seccion_id = @seccion_id
      `,
      {
        docente_id,
        seccion_id,
      },
      cliente,
    );
  }

  // =====================================
  // DESACTIVAR CURSO DE LA CLASE
  // EN LAS ASIGNACIONES INTERNAS
  // =====================================

  async desactivarAsignacionesCursoClase(
    curso_id: number,
    seccion_id: number,
    cliente?: PoolClient,
  ) {
    await this.baseDatosService.ejecutarConsulta(
      `
      UPDATE asignaciones_docentes

      SET activo = FALSE

      WHERE curso_id = @curso_id
        AND seccion_id = @seccion_id
      `,
      {
        curso_id,
        seccion_id,
      },
      cliente,
    );
  }

  // =====================================
  // DOCENTE - MIS CLASES
  // =====================================

  async obtenerMisClases(
    docente_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          ds.id AS docente_seccion_id,

          s.id AS seccion_id,
          s.nombre AS seccion,
          s.grado,
          s.anio_academico,

          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'curso_id', c.id,
                'codigo', c.codigo,
                'nombre', c.nombre
              )
              ORDER BY c.nombre
            )
            FILTER (
              WHERE c.id IS NOT NULL
            ),
            '[]'::json
          ) AS cursos

        FROM docentes_secciones ds

        INNER JOIN secciones s
          ON s.id = ds.seccion_id

        LEFT JOIN cursos_secciones cs
          ON cs.seccion_id = s.id
          AND cs.activo = TRUE

        LEFT JOIN cursos c
          ON c.id = cs.curso_id
          AND c.activo = TRUE

        WHERE ds.docente_id = @docente_id
          AND ds.activo = TRUE
          AND s.activo = TRUE

        GROUP BY
          ds.id,
          s.id,
          s.nombre,
          s.grado,
          s.anio_academico

        ORDER BY
          s.anio_academico DESC,
          s.grado,
          s.nombre
        `,
        {
          docente_id,
        },
      );

    return resultado.recordset;
  }

  // =====================================
  // DOCENTE - CLASES DISPONIBLES
  // =====================================

  async obtenerClasesDisponibles(
    docente_id: number,
  ) {
    const resultado =
      await this.baseDatosService.ejecutarConsulta(
        `
        SELECT
          s.id AS seccion_id,
          s.nombre AS seccion,
          s.grado,
          s.anio_academico,

          EXISTS (
            SELECT 1

            FROM docentes_secciones ds

            WHERE ds.docente_id = @docente_id
              AND ds.seccion_id = s.id
              AND ds.activo = TRUE
          ) AS asignada,

          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'curso_id', c.id,
                'codigo', c.codigo,
                'nombre', c.nombre
              )
              ORDER BY c.nombre
            )
            FILTER (
              WHERE c.id IS NOT NULL
            ),
            '[]'::json
          ) AS cursos

        FROM secciones s

        LEFT JOIN cursos_secciones cs
          ON cs.seccion_id = s.id
          AND cs.activo = TRUE

        LEFT JOIN cursos c
          ON c.id = cs.curso_id
          AND c.activo = TRUE

        WHERE s.activo = TRUE

        GROUP BY
          s.id,
          s.nombre,
          s.grado,
          s.anio_academico

        ORDER BY
          s.anio_academico DESC,
          s.grado,
          s.nombre
        `,
        {
          docente_id,
        },
      );

    return resultado.recordset;
  }
}