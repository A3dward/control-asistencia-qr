import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class RegistrarAsistenciaDto {
  @IsInt()
  @IsPositive()
  sesion_clase_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  codigo_qr: string;
}