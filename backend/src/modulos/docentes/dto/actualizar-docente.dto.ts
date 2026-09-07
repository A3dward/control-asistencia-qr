import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ActualizarDocenteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_completo?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  correo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo_docente?: string;
}