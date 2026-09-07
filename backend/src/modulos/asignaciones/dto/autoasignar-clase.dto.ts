import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class AutoasignarClaseDto {
  @IsInt()
  @IsPositive()
  curso_id: number;

  @IsInt()
  @IsPositive()
  seccion_id: number;
}