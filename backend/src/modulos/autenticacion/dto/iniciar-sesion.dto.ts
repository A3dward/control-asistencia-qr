import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class IniciarSesionDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  contrasena: string;
}