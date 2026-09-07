import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../servicios/api';

// =====================================
// INTERFACES
// =====================================

export interface Usuario {
  id: number;

  nombre_completo: string;

  correo: string;

  rol: 'ADMIN' | 'DOCENTE';

  docente_id: number | null;

  codigo_docente: string | null;
}

interface AutenticacionContextType {
  usuario: Usuario | null;

  autenticado: boolean;

  cargando: boolean;

  iniciarSesion: (
    correo: string,
    contrasena: string,
  ) => Promise<Usuario>;

  cerrarSesion: () => void;
}

// =====================================
// CONTEXTO
// =====================================

const AutenticacionContext =
  createContext<
    AutenticacionContextType | undefined
  >(undefined);

// =====================================
// PROVIDER
// =====================================

export function AutenticacionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    usuario,
    setUsuario,
  ] =
    useState<Usuario | null>(
      null,
    );

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  // =====================================
  // RECUPERAR SESION
  // =====================================

  useEffect(() => {
    const recuperarSesion =
      async () => {
        const token =
          localStorage.getItem(
            'access_token',
          );

        if (!token) {
          setCargando(false);
          return;
        }

        try {
          const respuesta =
            await api.get(
              '/autenticacion/perfil',
            );

          const perfil =
            respuesta.data.datos;

          const usuarioRecuperado: Usuario =
            {
              id:
                Number(
                  perfil.id,
                ),

              nombre_completo:
                perfil.nombre_completo,

              correo:
                perfil.correo,

              rol:
                perfil.rol,

              docente_id:
                perfil.docente_id
                  ? Number(
                      perfil.docente_id,
                    )
                  : null,

              codigo_docente:
                perfil.codigo_docente ??
                null,
            };

          setUsuario(
            usuarioRecuperado,
          );

          localStorage.setItem(
            'usuario',
            JSON.stringify(
              usuarioRecuperado,
            ),
          );
        } catch {
          localStorage.removeItem(
            'access_token',
          );

          localStorage.removeItem(
            'usuario',
          );

          setUsuario(null);
        } finally {
          setCargando(false);
        }
      };

    recuperarSesion();
  }, []);

  // =====================================
  // LOGIN
  // =====================================

  const iniciarSesion =
    async (
      correo: string,
      contrasena: string,
    ) => {
      const respuesta =
        await api.post(
          '/autenticacion/login',
          {
            correo,
            contrasena,
          },
        );

      const datos =
        respuesta.data.datos;

      const usuarioLogin: Usuario =
        {
          id:
            Number(
              datos.usuario.id,
            ),

          nombre_completo:
            datos.usuario
              .nombre_completo,

          correo:
            datos.usuario.correo,

          rol:
            datos.usuario.rol,

          docente_id:
            datos.usuario.docente_id
              ? Number(
                  datos.usuario
                    .docente_id,
                )
              : null,

          codigo_docente:
            datos.usuario
              .codigo_docente ??
            null,
        };

      localStorage.setItem(
        'access_token',
        datos.access_token,
      );

      localStorage.setItem(
        'usuario',
        JSON.stringify(
          usuarioLogin,
        ),
      );

      setUsuario(
        usuarioLogin,
      );

      return usuarioLogin;
    };

  // =====================================
  // LOGOUT
  // =====================================

  const cerrarSesion = () => {
    localStorage.removeItem(
      'access_token',
    );

    localStorage.removeItem(
      'usuario',
    );

    setUsuario(null);
  };

  return (
    <AutenticacionContext.Provider
      value={{
        usuario,

        autenticado:
          Boolean(usuario),

        cargando,

        iniciarSesion,

        cerrarSesion,
      }}
    >
      {children}
    </AutenticacionContext.Provider>
  );
}

// =====================================
// HOOK
// =====================================

export function useAutenticacion() {
  const contexto =
    useContext(
      AutenticacionContext,
    );

  if (!contexto) {
    throw new Error(
      'useAutenticacion debe utilizarse dentro de AutenticacionProvider',
    );
  }

  return contexto;
}