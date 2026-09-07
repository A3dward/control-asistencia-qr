import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearCursoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;
}