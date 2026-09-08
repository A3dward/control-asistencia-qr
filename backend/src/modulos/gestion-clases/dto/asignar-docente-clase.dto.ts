import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class AsignarDocenteClaseDto {
  @IsInt()
  @IsPositive()
  docente_id: number;

  @IsInt()
  @IsPositive()
  seccion_id: number;
}