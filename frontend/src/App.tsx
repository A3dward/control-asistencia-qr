import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import RutaProtegida from './componentes/RutaProtegida';

import Login from './paginas/Login';

import AdminDashboard from './paginas/AdminDashboard';

import DocenteDashboard from './paginas/DocenteDashboard';

import Estudiantes from './paginas/Estudiantes';

import Docentes from './paginas/Docentes';

import Secciones from './paginas/Secciones';

import Cursos from './paginas/Cursos';

import Inscripciones from './paginas/Inscripciones';

import Asignaciones from './paginas/Asignaciones';

function App() {
  return (
    <Routes>
      {/* ================================= */}
      {/* LOGIN */}
      {/* ================================= */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      {/* ================================= */}
      {/* ADMINISTRADOR */}
      {/* ================================= */}

      <Route
        element={
          <RutaProtegida
            rolesPermitidos={[
              'ADMIN',
            ]}
          />
        }
      >
        <Route
          path="/admin"
          element={
            <AdminDashboard />
          }
        />

        <Route
          path="/admin/estudiantes"
          element={
            <Estudiantes />
          }
        />

        <Route
          path="/admin/docentes"
          element={
            <Docentes />
          }
        />

        <Route
          path="/admin/secciones"
          element={
            <Secciones />
          }
        />

        <Route
          path="/admin/cursos"
          element={
            <Cursos />
          }
        />

        <Route
          path="/admin/inscripciones"
          element={
            <Inscripciones />
          }
        />

        <Route
          path="/admin/asignaciones"
          element={
            <Asignaciones />
          }
        />
      </Route>

      {/* ================================= */}
      {/* DOCENTE */}
      {/* ================================= */}

      <Route
        element={
          <RutaProtegida
            rolesPermitidos={[
              'DOCENTE',
            ]}
          />
        }
      >
        <Route
          path="/docente"
          element={
            <DocenteDashboard />
          }
        />
      </Route>

      {/* ================================= */}
      {/* PAGINA PRINCIPAL */}
      {/* ================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      {/* ================================= */}
      {/* RUTA NO ENCONTRADA */}
      {/* ================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;