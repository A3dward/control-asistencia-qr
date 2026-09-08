import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearCursoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;
}