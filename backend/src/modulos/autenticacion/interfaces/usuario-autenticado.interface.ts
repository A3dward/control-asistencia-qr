export interface UsuarioAutenticado {
  sub: number;

  correo: string;

  rol: string;

  docente_id: number | null;

  iat?: number;

  exp?: number;
}