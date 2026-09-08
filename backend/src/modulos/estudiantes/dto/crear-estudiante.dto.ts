import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearEstudianteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo_estudiante?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos: string;
}