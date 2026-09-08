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
  AsignarDocenteClaseDto,
} from './dto/asignar-docente-clase.dto';

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
  // SOLO CONSULTA
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
  // ADMIN - CURSOS POR CLASE
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
        'Curso quitado de la clase correctamente',

      datos,
    };
  }

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
        'Curso reactivado en la clase correctamente',

      datos,
    };
  }

  // =====================================
  // ADMIN - CLASES DE DOCENTES
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
        'Asignaciones de clases obtenidas correctamente',

      total:
        datos.length,

      datos,
    };
  }

  @Post(
    'docentes-clases',
  )
  @Roles('ADMIN')
  async asignarClaseDocente(
    @Body()
    datos:
      AsignarDocenteClaseDto,
  ) {
    const relacion =
      await this.gestionClasesService.asignarClaseDocente(
        datos,
      );

    return {
      mensaje:
        'Clase asignada al docente correctamente',

      datos:
        relacion,
    };
  }

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

  @Patch(
    'docentes-clases/:id/activar',
  )
  @Roles('ADMIN')
  async reactivarClaseDocente(
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
        'Clase reactivada para el docente correctamente',

      datos,
    };
  }
}