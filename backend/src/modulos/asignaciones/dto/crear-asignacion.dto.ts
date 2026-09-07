import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class CrearAsignacionDto {
  @IsInt()
  @IsPositive()
  docente_id: number;

  @IsInt()
  @IsPositive()
  curso_id: number;

  @IsInt()
  @IsPositive()
  seccion_id: number;
}