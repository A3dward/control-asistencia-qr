import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import {
  Spin,
} from 'antd';

import {
  useAutenticacion,
} from '../contextos/AutenticacionContext';

interface Props {
  rolesPermitidos?: Array<
    'ADMIN' | 'DOCENTE'
  >;
}

export default function RutaProtegida({
  rolesPermitidos,
}: Props) {
  const {
    usuario,
    autenticado,
    cargando,
  } =
    useAutenticacion();

  if (cargando) {
    return (
      <div className="pantalla-cargando">
        <Spin
          size="large"
        />
      </div>
    );
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    rolesPermitidos &&
    usuario &&
    !rolesPermitidos.includes(
      usuario.rol,
    )
  ) {
    if (
      usuario.rol === 'ADMIN'
    ) {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/docente"
        replace
      />
    );
  }

  return <Outlet />;
}