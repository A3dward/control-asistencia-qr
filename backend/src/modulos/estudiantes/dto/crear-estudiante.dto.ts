import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearEstudianteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo_estudiante: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos: string;
}