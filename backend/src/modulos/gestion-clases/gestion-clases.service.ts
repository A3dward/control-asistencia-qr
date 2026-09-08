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

@Injectable()
export class GestionClasesService {
  constructor(
    private readonly repository:
      GestionClasesRepository,

    private readonly baseDatosService:
      BaseDatosService,
  ) {}

  // =====================================
  // ADMIN - CONFIGURACION
  // =====================================

  async obtenerConfiguracionCursos() {
    return this.repository.obtenerConfiguracionCursos();
  }

  async obtenerDocentesClases() {
    return this.repository.obtenerDocentesClases();
  }

  // =====================================
  // ADMIN - ASOCIAR CURSO A CLASE
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

        // Un curso solamente puede
        // pertenecer a una clase activa.

        const relacionActiva =
          await this.repository.buscarCursoEnClaseActiva(
            datos.curso_id,
            cliente,
          );

        if (relacionActiva) {
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
          const nuevaRelacion =
            await this.repository.crearCursoClase(
              datos.curso_id,
              datos.seccion_id,
              cliente,
            );

          relacionId =
            Number(
              nuevaRelacion.id,
            );
        }

        // Si ya existen maestros
        // asignados a la clase, agregar
        // también este curso a sus
        // relaciones internas.

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
  // ADMIN - CURSO DE CLASE
  // ACTIVAR / DESACTIVAR
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

        if (!activo) {
          await this.repository.cambiarEstadoCursoClase(
            id,
            false,
            cliente,
          );

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

        if (
          !Boolean(
            relacion.curso_activo,
          )
        ) {
          throw new BadRequestException(
            'No se puede reactivar porque el curso se encuentra inactivo.',
          );
        }

        if (
          !Boolean(
            relacion.clase_activa,
          )
        ) {
          throw new BadRequestException(
            'No se puede reactivar porque la clase se encuentra inactiva.',
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
            'El curso ya pertenece actualmente a otra clase.',
          );
        }

        await this.repository.cambiarEstadoCursoClase(
          id,
          true,
          cliente,
        );

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
  // DOCENTE - MIS CLASES
  // =====================================

  async obtenerMisClases(
    docenteId: number,
  ) {
    this.validarDocenteId(
      docenteId,
    );

    return this.repository.obtenerMisClases(
      docenteId,
    );
  }

  // =====================================
  // DOCENTE - CLASES DISPONIBLES
  // =====================================

  async obtenerClasesDisponibles(
    docenteId: number,
  ) {
    this.validarDocenteId(
      docenteId,
    );

    return this.repository.obtenerClasesDisponibles(
      docenteId,
    );
  }

  // =====================================
  // DOCENTE - AUTOASIGNARSE CLASE
  // =====================================

  async autoasignarClase(
    docenteId: number,
    seccionId: number,
  ) {
    this.validarDocenteId(
      docenteId,
    );

    return this.baseDatosService.ejecutarTransaccion(
      async (
        cliente,
      ) => {
        const docente =
          await this.repository.buscarDocentePorId(
            docenteId,
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
            'El usuario docente se encuentra inactivo.',
          );
        }

        const clase =
          await this.repository.buscarSeccionPorId(
            seccionId,
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

        const cursos =
          await this.repository.obtenerCursosActivosPorClase(
            seccionId,
            cliente,
          );

        if (
          cursos.length === 0
        ) {
          throw new BadRequestException(
            'Esta clase aun no tiene cursos configurados por el administrador.',
          );
        }

        const existente =
          await this.repository.buscarDocenteClase(
            docenteId,
            seccionId,
            cliente,
          );

        if (
          existente &&
          Boolean(
            existente.activo,
          )
        ) {
          throw new ConflictException(
            'Ya tiene asignada esta clase.',
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
        } else {
          await this.repository.crearDocenteClase(
            docenteId,
            seccionId,
            cliente,
          );
        }

        // Crear una asignacion interna
        // por cada curso de la clase.
        //
        // Esto permite conservar el
        // funcionamiento actual de
        // sesiones y asistencias.

        for (
          const curso of cursos
        ) {
          await this.repository.sincronizarAsignacion(
            docenteId,
            Number(
              curso.id,
            ),
            seccionId,
            cliente,
          );
        }

        return {
          docente_id:
            docenteId,

          seccion_id:
            seccionId,

          grado:
            clase.grado,

          seccion:
            clase.nombre,

          anio_academico:
            clase.anio_academico,

          cursos,
        };
      },
    );
  }

  // =====================================
  // ADMIN - DESASIGNAR / REACTIVAR
  // CLASE DE DOCENTE
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
              : 'El docente ya se encuentra desasignado de esta clase.',
          );
        }

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

        if (
          !Boolean(
            relacion.docente_activo,
          ) ||
          !Boolean(
            relacion.usuario_activo,
          )
        ) {
          throw new BadRequestException(
            'No se puede reactivar porque el docente se encuentra inactivo.',
          );
        }

        if (
          !Boolean(
            relacion.clase_activa,
          )
        ) {
          throw new BadRequestException(
            'No se puede reactivar porque la clase se encuentra inactiva.',
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
  // VALIDACION
  // =====================================

  private validarDocenteId(
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
  }
}