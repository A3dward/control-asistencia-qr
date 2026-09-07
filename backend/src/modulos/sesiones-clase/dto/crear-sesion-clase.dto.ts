import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class CrearSesionClaseDto {
  @IsInt()
  @IsPositive()
  asignacion_docente_id: number;
}