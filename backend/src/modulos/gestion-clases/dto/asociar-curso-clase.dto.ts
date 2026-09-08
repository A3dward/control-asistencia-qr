import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class AsociarCursoClaseDto {
  @IsInt()
  @IsPositive()
  curso_id: number;

  @IsInt()
  @IsPositive()
  seccion_id: number;
}