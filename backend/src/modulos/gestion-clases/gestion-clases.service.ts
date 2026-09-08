import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  BaseDatosService,
} from '../../base-datos/base-datos.service';

import {
  GestionClasesRepository,
} from './gestion-clases.repository';

import {
  AsociarCursoClaseDto,
} from './dto/asociar-curso-clase.dto';

import {
  AsignarDocenteClaseDto,
} from './dto/asignar-docente-clase.dto';

@Injectable()
export class GestionClasesService {
  constructor(
    private readonly repository:
      GestionClasesRepository,

    private readonly baseDatosService:
      BaseDatosService,
  ) {}

  // =====================================
  // ADMIN - CONFIGURACION CURSOS / CLASES
  // =====================================

  async obtenerConfiguracionCursos() {
    return this.repository.obtenerConfiguracionCursos();
  }

  // =====================================
  // ADMIN - DOCENTES / CLASES
  // =====================================

  async obtenerDocentesClases() {
    return this.repository.obtenerDocentesClases();
  }

  // =====================================
  // ADMIN - ASOCIAR CURSO A UNA CLASE
  // =====================================

  async asociarCursoClase(
    datos:
      AsociarCursoClaseDto,
  ) {
    return this.baseDatosService.ejecutarTransaccion(
      async (
        cliente,
      ) => {
        const curso =
          await this.repository.buscarCursoPorId(
            datos.curso_id,
            cliente,
          );

        if (!curso) {
          throw new NotFoundException(
            'El curso no existe.',
          );
        }

        if (
          !Boolean(
            curso.activo,
          )
        ) {
          throw new BadRequestException(
            'El curso se encuentra inactivo.',
          );
        }

        const clase =
          await this.repository.buscarSeccionPorId(
            datos.seccion_id,
            cliente,
          );

        if (!clase) {
          throw new NotFoundException(
            'La clase no existe.',
          );
        }

        if (
          !Boolean(
            clase.activo,
          )
        ) {
          throw new BadRequestException(
            'La clase se encuentra inactiva.',
          );
        }

        // =================================
        // UN CURSO SOLO PUEDE PERTENECER
        // A UNA CLASE ACTIVA
        // =================================

        const relacionActiva =
          await this.repository.buscarCursoEnClaseActiva(
            datos.curso_id,
            cliente,
          );

        if (
          relacionActiva
        ) {
          if (
            Number(
              relacionActiva.seccion_id,
            ) ===
            Number(
              datos.seccion_id,
            )
          ) {
            throw new ConflictException(
              'Este curso ya pertenece a esta clase.',
            );
          }

          throw new ConflictException(
            `Este curso ya pertenece a ${relacionActiva.grado} - ${relacionActiva.seccion} - ${relacionActiva.anio_academico}.`,
          );
        }

        const relacionExistente =
          await this.repository.buscarCursoClaseExacta(
            datos.curso_id,
            datos.seccion_id,
            cliente,
          );

        let relacionId:
          number;

        // Si estuvo anteriormente
        // en esta clase, simplemente
        // reactivamos la relacion.

        if (
          relacionExistente
        ) {
          await this.repository.cambiarEstadoCursoClase(
            Number(
              relacionExistente.id,
            ),
            true,
            cliente,
          );

          relacionId =
            Number(
              relacionExistente.id,
            );
        } else {
          const relacion =
            await this.repository.crearCursoClase(
              datos.curso_id,
              datos.seccion_id,
              cliente,
            );

          relacionId =
            Number(
              relacion.id,
            );
        }

        // =================================
        // SI LA CLASE YA TIENE DOCENTES,
        // EL NUEVO CURSO SE AGREGA
        // AUTOMATICAMENTE A ELLOS.
        // =================================

        const docentes =
          await this.repository.obtenerDocentesActivosPorClase(
            datos.seccion_id,
            cliente,
          );

        for (
          const docente of docentes
        ) {
          await this.repository.sincronizarAsignacion(
            Number(
              docente.docente_id,
            ),
            datos.curso_id,
            datos.seccion_id,
            cliente,
          );
        }

        return this.repository.buscarCursoClasePorId(
          relacionId,
          cliente,
        );
      },
    );
  }

  // =====================================
  // ADMIN - ACTIVAR / DESACTIVAR
  // CURSO DE UNA CLASE
  // =====================================

  async cambiarEstadoCursoClase(
    id: number,
    activo: boolean,
  ) {
    return this.baseDatosService.ejecutarTransaccion(
      async (
        cliente,
      ) => {
        const relacion =
          await this.repository.buscarCursoClasePorId(
            id,
            cliente,
          );

        if (!relacion) {
          throw new NotFoundException(
            'La relacion entre el curso y la clase no existe.',
          );
        }

        if (
          Boolean(
            relacion.activo,
          ) === activo
        ) {
          throw new BadRequestException(
            activo
              ? 'El curso ya se encuentra asignado a esta clase.'
              : 'El curso ya se encuentra desasignado de esta clase.',
          );
        }

        // =================================
        // QUITAR CURSO
        // =================================

        if (!activo) {
          await this.repository.cambiarEstadoCursoClase(
            id,
            false,
            cliente,
          );

          // También desactivamos las
          // asignaciones internas del
          // curso para los docentes.

          await this.repository.desactivarAsignacionesCursoClase(
            Number(
              relacion.curso_id,
            ),
            Number(
              relacion.seccion_id,
            ),
            cliente,
          );

          return this.repository.buscarCursoClasePorId(
            id,
            cliente,
          );
        }

        // =================================
        // REACTIVAR CURSO
        // =================================

        if (
          !Boolean(
            relacion.curso_activo,
          )
        ) {
          throw new BadRequestException(
            'No puede reactivar esta asignacion porque el curso esta inactivo.',
          );
        }

        if (
          !Boolean(
            relacion.clase_activa,
          )
        ) {
          throw new BadRequestException(
            'No puede reactivar esta asignacion porque la clase esta inactiva.',
          );
        }

        const otraRelacion =
          await this.repository.buscarCursoEnClaseActiva(
            Number(
              relacion.curso_id,
            ),
            cliente,
          );

        if (
          otraRelacion &&
          Number(
            otraRelacion.id,
          ) !==
            Number(id)
        ) {
          throw new ConflictException(
            'Este curso actualmente pertenece a otra clase.',
          );
        }

        await this.repository.cambiarEstadoCursoClase(
          id,
          true,
          cliente,
        );

        // Agregamos nuevamente el
        // curso a todos los profesores
        // de la clase.

        const docentes =
          await this.repository.obtenerDocentesActivosPorClase(
            Number(
              relacion.seccion_id,
            ),
            cliente,
          );

        for (
          const docente of docentes
        ) {
          await this.repository.sincronizarAsignacion(
            Number(
              docente.docente_id,
            ),
            Number(
              relacion.curso_id,
            ),
            Number(
              relacion.seccion_id,
            ),
            cliente,
          );
        }

        return this.repository.buscarCursoClasePorId(
          id,
          cliente,
        );
      },
    );
  }

  // =====================================
  // ADMIN - ASIGNAR CLASE A DOCENTE
  // =====================================

  async asignarClaseDocente(
    datos:
      AsignarDocenteClaseDto,
  ) {
    return this.baseDatosService.ejecutarTransaccion(
      async (
        cliente,
      ) => {
        // =================================
        // VALIDAR DOCENTE
        // =================================

        const docente =
          await this.repository.buscarDocentePorId(
            datos.docente_id,
            cliente,
          );

        if (!docente) {
          throw new NotFoundException(
            'El docente no existe.',
          );
        }

        if (
          !Boolean(
            docente.activo,
          ) ||
          !Boolean(
            docente.usuario_activo,
          )
        ) {
          throw new BadRequestException(
            'El docente se encuentra inactivo.',
          );
        }

        // =================================
        // VALIDAR CLASE
        // =================================

        const clase =
          await this.repository.buscarSeccionPorId(
            datos.seccion_id,
            cliente,
          );

        if (!clase) {
          throw new NotFoundException(
            'La clase no existe.',
          );
        }

        if (
          !Boolean(
            clase.activo,
          )
        ) {
          throw new BadRequestException(
            'La clase se encuentra inactiva.',
          );
        }

        // =================================
        // LA CLASE DEBE TENER CURSOS
        // =================================

        const cursos =
          await this.repository.obtenerCursosActivosPorClase(
            datos.seccion_id,
            cliente,
          );

        if (
          cursos.length === 0
        ) {
          throw new BadRequestException(
            'La clase no tiene cursos asignados. Configure primero los cursos de esta clase.',
          );
        }

        // =================================
        // VALIDAR RELACION DOCENTE-CLASE
        // =================================

        const existente =
          await this.repository.buscarDocenteClase(
            datos.docente_id,
            datos.seccion_id,
            cliente,
          );

        let relacionId:
          number;

        if (
          existente &&
          Boolean(
            existente.activo,
          )
        ) {
          throw new ConflictException(
            'El docente ya tiene asignada esta clase.',
          );
        }

        if (existente) {
          await this.repository.cambiarEstadoDocenteClase(
            Number(
              existente.id,
            ),
            true,
            cliente,
          );

          relacionId =
            Number(
              existente.id,
            );
        } else {
          const relacion =
            await this.repository.crearDocenteClase(
              datos.docente_id,
              datos.seccion_id,
              cliente,
            );

          relacionId =
            Number(
              relacion.id,
            );
        }

        // =================================
        // ASIGNAR AUTOMATICAMENTE TODOS
        // LOS CURSOS DE LA CLASE
        // =================================

        for (
          const curso of cursos
        ) {
          await this.repository.sincronizarAsignacion(
            datos.docente_id,
            Number(
              curso.id,
            ),
            datos.seccion_id,
            cliente,
          );
        }

        return this.repository.buscarDocenteClasePorId(
          relacionId,
          cliente,
        );
      },
    );
  }

  // =====================================
  // ADMIN - DESASIGNAR / REACTIVAR
  // CLASE DEL DOCENTE
  // =====================================

  async cambiarEstadoDocenteClase(
    id: number,
    activo: boolean,
  ) {
    return this.baseDatosService.ejecutarTransaccion(
      async (
        cliente,
      ) => {
        const relacion =
          await this.repository.buscarDocenteClasePorId(
            id,
            cliente,
          );

        if (!relacion) {
          throw new NotFoundException(
            'La asignacion del docente a la clase no existe.',
          );
        }

        if (
          Boolean(
            relacion.activo,
          ) === activo
        ) {
          throw new BadRequestException(
            activo
              ? 'El docente ya tiene activa esta clase.'
              : 'La clase ya se encuentra desasignada del docente.',
          );
        }

        // =================================
        // DESASIGNAR
        // =================================

        if (!activo) {
          await this.repository.cambiarEstadoDocenteClase(
            id,
            false,
            cliente,
          );

          await this.repository.desactivarAsignacionesDocenteClase(
            Number(
              relacion.docente_id,
            ),
            Number(
              relacion.seccion_id,
            ),
            cliente,
          );

          return this.repository.buscarDocenteClasePorId(
            id,
            cliente,
          );
        }

        // =================================
        // REACTIVAR
        // =================================

        if (
          !Boolean(
            relacion.docente_activo,
          ) ||
          !Boolean(
            relacion.usuario_activo,
          )
        ) {
          throw new BadRequestException(
            'No se puede reactivar porque el docente esta inactivo.',
          );
        }

        if (
          !Boolean(
            relacion.clase_activa,
          )
        ) {
          throw new BadRequestException(
            'No se puede reactivar porque la clase esta inactiva.',
          );
        }

        const cursos =
          await this.repository.obtenerCursosActivosPorClase(
            Number(
              relacion.seccion_id,
            ),
            cliente,
          );

        if (
          cursos.length === 0
        ) {
          throw new BadRequestException(
            'La clase no tiene cursos activos.',
          );
        }

        await this.repository.cambiarEstadoDocenteClase(
          id,
          true,
          cliente,
        );

        for (
          const curso of cursos
        ) {
          await this.repository.sincronizarAsignacion(
            Number(
              relacion.docente_id,
            ),
            Number(
              curso.id,
            ),
            Number(
              relacion.seccion_id,
            ),
            cliente,
          );
        }

        return this.repository.buscarDocenteClasePorId(
          id,
          cliente,
        );
      },
    );
  }

  // =====================================
  // DOCENTE - MIS CLASES
  // SOLO CONSULTA
  // =====================================

  async obtenerMisClases(
    docenteId: number,
  ) {
    if (
      !Number.isInteger(
        docenteId,
      ) ||
      docenteId <= 0
    ) {
      throw new ForbiddenException(
        'No se pudo identificar al docente.',
      );
    }

    return this.repository.obtenerMisClases(
      docenteId,
    );
  }
}