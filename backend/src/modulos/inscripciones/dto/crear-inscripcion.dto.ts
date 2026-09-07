import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class CrearInscripcionDto {
  @IsInt()
  @IsPositive()
  estudiante_id: number;

  @IsInt()
  @IsPositive()
  seccion_id: number;
}