import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  GestionClasesService,
} from './gestion-clases.service';

import {
  AsociarCursoClaseDto,
} from './dto/asociar-curso-clase.dto';

import {
  AutenticacionGuard,
} from '../autenticacion/guards/autenticacion.guard';

import {
  RolesGuard,
} from '../autenticacion/guards/roles.guard';

import {
  Roles,
} from '../autenticacion/decorators/roles.decorator';

import {
  UsuarioAutenticado,
} from '../autenticacion/interfaces/usuario-autenticado.interface';

@Controller(
  'gestion-clases',
)
@UseGuards(
  AutenticacionGuard,
  RolesGuard,
)
export class GestionClasesController {
  constructor(
    private readonly gestionClasesService:
      GestionClasesService,
  ) {}

  // =====================================
  // DOCENTE - MIS CLASES
  // =====================================

  @Get('mis-clases')
  @Roles('DOCENTE')
  async obtenerMisClases(
    @Req()
    request: {
      usuario:
        UsuarioAutenticado;
    },
  ) {
    const datos =
      await this.gestionClasesService.obtenerMisClases(
        Number(
          request.usuario.docente_id,
        ),
      );

    return {
      mensaje:
        'Mis clases obtenidas correctamente',

      total:
        datos.length,

      datos,
    };
  }

  // =====================================
  // DOCENTE - CLASES DISPONIBLES
  // =====================================

  @Get(
    'clases-disponibles',
  )
  @Roles('DOCENTE')
  async obtenerClasesDisponibles(
    @Req()
    request: {
      usuario:
        UsuarioAutenticado;
    },
  ) {
    const datos =
      await this.gestionClasesService.obtenerClasesDisponibles(
        Number(
          request.usuario.docente_id,
        ),
      );

    return {
      mensaje:
        'Clases disponibles obtenidas correctamente',

      total:
        datos.length,

      datos,
    };
  }

  // =====================================
  // DOCENTE - AUTOASIGNARSE CLASE
  // =====================================

  @Post(
    'autoasignar/:seccionId',
  )
  @Roles('DOCENTE')
  async autoasignarClase(
    @Req()
    request: {
      usuario:
        UsuarioAutenticado;
    },

    @Param(
      'seccionId',
      ParseIntPipe,
    )
    seccionId: number,
  ) {
    const datos =
      await this.gestionClasesService.autoasignarClase(
        Number(
          request.usuario.docente_id,
        ),
        seccionId,
      );

    return {
      mensaje:
        'Clase asignada correctamente',

      datos,
    };
  }

  // =====================================
  // ADMIN - CONFIGURACION CURSOS
  // =====================================

  @Get(
    'configuracion-cursos',
  )
  @Roles('ADMIN')
  async obtenerConfiguracionCursos() {
    const datos =
      await this.gestionClasesService.obtenerConfiguracionCursos();

    return {
      mensaje:
        'Configuracion de cursos obtenida correctamente',

      total:
        datos.length,

      datos,
    };
  }

  // =====================================
  // ADMIN - ASOCIAR CURSO A CLASE
  // =====================================

  @Post(
    'cursos-clases',
  )
  @Roles('ADMIN')
  async asociarCursoClase(
    @Body()
    datos:
      AsociarCursoClaseDto,
  ) {
    const relacion =
      await this.gestionClasesService.asociarCursoClase(
        datos,
      );

    return {
      mensaje:
        'Curso asignado a la clase correctamente',

      datos:
        relacion,
    };
  }

  // =====================================
  // ADMIN - QUITAR CURSO
  // =====================================

  @Patch(
    'cursos-clases/:id/desactivar',
  )
  @Roles('ADMIN')
  async desactivarCursoClase(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const datos =
      await this.gestionClasesService.cambiarEstadoCursoClase(
        id,
        false,
      );

    return {
      mensaje:
        'Curso desasignado de la clase correctamente',

      datos,
    };
  }

  // =====================================
  // ADMIN - REACTIVAR CURSO
  // =====================================

  @Patch(
    'cursos-clases/:id/activar',
  )
  @Roles('ADMIN')
  async activarCursoClase(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const datos =
      await this.gestionClasesService.cambiarEstadoCursoClase(
        id,
        true,
      );

    return {
      mensaje:
        'Curso asignado nuevamente a la clase',

      datos,
    };
  }

  // =====================================
  // ADMIN - DOCENTES / CLASES
  // =====================================

  @Get(
    'docentes-clases',
  )
  @Roles('ADMIN')
  async obtenerDocentesClases() {
    const datos =
      await this.gestionClasesService.obtenerDocentesClases();

    return {
      mensaje:
        'Clases de los docentes obtenidas correctamente',

      total:
        datos.length,

      datos,
    };
  }

  // =====================================
  // ADMIN - DESASIGNAR CLASE DOCENTE
  // =====================================

  @Patch(
    'docentes-clases/:id/desactivar',
  )
  @Roles('ADMIN')
  async desasignarClaseDocente(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const datos =
      await this.gestionClasesService.cambiarEstadoDocenteClase(
        id,
        false,
      );

    return {
      mensaje:
        'Clase desasignada del docente correctamente',

      datos,
    };
  }

  // =====================================
  // ADMIN - REACTIVAR CLASE DOCENTE
  // =====================================

  @Patch(
    'docentes-clases/:id/activar',
  )
  @Roles('ADMIN')
  async activarClaseDocente(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const datos =
      await this.gestionClasesService.cambiarEstadoDocenteClase(
        id,
        true,
      );

    return {
      mensaje:
        'Clase asignada nuevamente al docente',

      datos,
    };
  }
}