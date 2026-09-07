import { Module } from '@nestjs/common';

import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';
import { CursosRepository } from './cursos.repository';

@Module({
  controllers: [
    CursosController,
  ],

  providers: [
    CursosService,
    CursosRepository,
  ],

  exports: [
    CursosService,
  ],
})
export class CursosModule {}