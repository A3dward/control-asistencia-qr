import {
  Module,
} from '@nestjs/common';

import {
  GestionClasesController,
} from './gestion-clases.controller';

import {
  GestionClasesService,
} from './gestion-clases.service';

import {
  GestionClasesRepository,
} from './gestion-clases.repository';

@Module({
  controllers: [
    GestionClasesController,
  ],

  providers: [
    GestionClasesService,
    GestionClasesRepository,
  ],

  exports: [
    GestionClasesService,
  ],
})
export class GestionClasesModule {}