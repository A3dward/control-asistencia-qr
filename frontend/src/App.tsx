import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import RutaProtegida from './componentes/RutaProtegida';

import Login from './paginas/Login';

import AdminDashboard from './paginas/AdminDashboard';

import DocenteDashboard from './paginas/DocenteDashboard';

import MisClases from './paginas/MisClases';

import EstudiantesDocente from './paginas/EstudiantesDocente';

import Estudiantes from './paginas/Estudiantes';

import Docentes from './paginas/Docentes';

import Secciones from './paginas/Secciones';

import Cursos from './paginas/Cursos';

import CursosClases from './paginas/CursosClases';

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
      {/* ADMIN */}
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
          path="/admin/cursos-clases"
          element={
            <CursosClases />
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

        <Route
          path="/docente/clases"
          element={
            <MisClases />
          }
        />

        <Route
          path="/docente/estudiantes"
          element={
            <EstudiantesDocente />
          }
        />
      </Route>

      {/* ================================= */}
      {/* REDIRECCIONES */}
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