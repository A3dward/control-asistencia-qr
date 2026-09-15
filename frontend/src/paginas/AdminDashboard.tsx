import {
  ApartmentOutlined,
  BookOutlined,
  FileTextOutlined,
  LogoutOutlined,
  QrcodeOutlined,
  ReadOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  Button,
  Card,
  Col,
  Row,
  Typography,
} from 'antd';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useAutenticacion,
} from '../contextos/AutenticacionContext';

const {
  Title,
  Text,
} = Typography;

export default function AdminDashboard() {
  const navigate =
    useNavigate();

  const {
    usuario,
    cerrarSesion,
  } =
    useAutenticacion();

  // =====================================
  // SALIR
  // =====================================

  const salir =
    () => {
      cerrarSesion();

      navigate(
        '/login',
        {
          replace:
            true,
        },
      );
    };

  // =====================================
  // VISTA
  // =====================================

  return (
    <div
      className="dashboard-pagina"
    >
      <div
        className="dashboard-contenido"
      >
        {/* ================================= */}
        {/* MARCA */}
        {/* ================================= */}

        <div
          className="dashboard-marca"
        >
          <div
            className="dashboard-marca-icono"
          >
            <QrcodeOutlined />
          </div>

          <div
            className="dashboard-marca-texto"
          >
            <span
              className="dashboard-marca-titulo"
            >
              Control de Asistencia
            </span>

            <span
              className="dashboard-marca-subtitulo"
            >
              INEB de Telesecundaria ·
              Aldea Cabañas
            </span>
          </div>
        </div>

        {/* ================================= */}
        {/* ENCABEZADO */}
        {/* ================================= */}

        <div
          className="dashboard-encabezado"
        >
          <div>
            <span
              className="dashboard-rol"
            >
              Administración
            </span>

            <Title
              level={2}
              className="dashboard-titulo"
            >
              Panel administrativo
            </Title>

            <Text
              className="dashboard-bienvenida"
            >
              Bienvenido,{' '}
              {
                usuario?.nombre_completo
              }
            </Text>
          </div>

          <Button
            danger
            icon={
              <LogoutOutlined />
            }
            onClick={
              salir
            }
          >
            Cerrar sesión
          </Button>
        </div>

        {/* ================================= */}
        {/* PERSONAS */}
        {/* ================================= */}

        <section
          className="dashboard-seccion"
        >
          <div
            className="dashboard-seccion-encabezado"
          >
            <Title
              level={4}
              className="dashboard-seccion-titulo"
            >
              Personas
            </Title>

            <Text
              className="dashboard-seccion-texto"
            >
              Administre estudiantes
              y docentes del
              establecimiento.
            </Text>
          </div>

          <Row
            gutter={[
              16,
              16,
            ]}
          >
            <Col
              xs={24}
              md={12}
            >
              <Card
                className="dashboard-card"
              >
                <div
                  className="dashboard-card-icono"
                >
                  <UserOutlined />
                </div>

                <Title
                  level={4}
                  className="dashboard-card-titulo"
                >
                  Estudiantes
                </Title>

                <Text
                  className="dashboard-card-texto"
                >
                  Registre estudiantes,
                  consulte sus datos y
                  asígnelos a una clase.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    block
                    onClick={() =>
                      navigate(
                        '/admin/estudiantes',
                      )
                    }
                  >
                    Administrar estudiantes
                  </Button>
                </div>
              </Card>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Card
                className="dashboard-card"
              >
                <div
                  className="dashboard-card-icono"
                >
                  <TeamOutlined />
                </div>

                <Title
                  level={4}
                  className="dashboard-card-titulo"
                >
                  Docentes
                </Title>

                <Text
                  className="dashboard-card-texto"
                >
                  Registre y mantenga
                  actualizada la
                  información de los
                  docentes.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    block
                    onClick={() =>
                      navigate(
                        '/admin/docentes',
                      )
                    }
                  >
                    Administrar docentes
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ================================= */}
        {/* CONFIGURACION ACADEMICA */}
        {/* ================================= */}

        <section
          className="dashboard-seccion"
        >
          <div
            className="dashboard-seccion-encabezado"
          >
            <Title
              level={4}
              className="dashboard-seccion-titulo"
            >
              Configuración académica
            </Title>

            <Text
              className="dashboard-seccion-texto"
            >
              Defina las clases,
              cursos y asignaciones
              que utilizarán los
              docentes.
            </Text>
          </div>

          <Row
            gutter={[
              16,
              16,
            ]}
          >
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card
                className="dashboard-card"
              >
                <div
                  className="dashboard-card-icono"
                >
                  <ReadOutlined />
                </div>

                <Title
                  level={4}
                  className="dashboard-card-titulo"
                >
                  Clases
                </Title>

                <Text
                  className="dashboard-card-texto"
                >
                  Administre grados,
                  secciones y ciclos.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    block
                    onClick={() =>
                      navigate(
                        '/admin/secciones',
                      )
                    }
                  >
                    Ver clases
                  </Button>
                </div>
              </Card>
            </Col>

            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card
                className="dashboard-card"
              >
                <div
                  className="dashboard-card-icono"
                >
                  <BookOutlined />
                </div>

                <Title
                  level={4}
                  className="dashboard-card-titulo"
                >
                  Cursos
                </Title>

                <Text
                  className="dashboard-card-texto"
                >
                  Cree y administre
                  los cursos del ciclo.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    block
                    onClick={() =>
                      navigate(
                        '/admin/cursos',
                      )
                    }
                  >
                    Ver cursos
                  </Button>
                </div>
              </Card>
            </Col>

            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card
                className="dashboard-card"
              >
                <div
                  className="dashboard-card-icono"
                >
                  <ApartmentOutlined />
                </div>

                <Title
                  level={4}
                  className="dashboard-card-titulo"
                >
                  Cursos por clase
                </Title>

                <Text
                  className="dashboard-card-texto"
                >
                  Indique qué cursos
                  corresponden a cada
                  clase.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    block
                    onClick={() =>
                      navigate(
                        '/admin/cursos-clases',
                      )
                    }
                  >
                    Configurar
                  </Button>
                </div>
              </Card>
            </Col>

            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card
                className="dashboard-card"
              >
                <div
                  className="dashboard-card-icono"
                >
                  <SolutionOutlined />
                </div>

                <Title
                  level={4}
                  className="dashboard-card-titulo"
                >
                  Asignaciones
                </Title>

                <Text
                  className="dashboard-card-texto"
                >
                  Asigne clases a los
                  docentes responsables.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    block
                    onClick={() =>
                      navigate(
                        '/admin/asignaciones',
                      )
                    }
                  >
                    Ver asignaciones
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ================================= */}
        {/* REPORTES */}
        {/* ================================= */}

        <section
          className="dashboard-seccion"
        >
          <div
            className="dashboard-seccion-encabezado"
          >
            <Title
              level={4}
              className="dashboard-seccion-titulo"
            >
              Reportes
            </Title>

            <Text
              className="dashboard-seccion-texto"
            >
              Consulte el trabajo de
              asistencia realizado por
              los docentes.
            </Text>
          </div>

          <Row>
            <Col
              xs={24}
            >
              <Card
                className="dashboard-card"
              >
                <div
                  className="dashboard-card-icono"
                >
                  <FileTextOutlined />
                </div>

                <Title
                  level={4}
                  className="dashboard-card-titulo"
                >
                  Reporte de asistencias por docente
                </Title>

                <Text
                  className="dashboard-card-texto"
                >
                  Seleccione un docente
                  y un período para
                  consultar los cursos
                  impartidos, estudiantes
                  presentes y ausentes.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    type="primary"
                    onClick={() =>
                      navigate(
                        '/admin/reportes-asistencia',
                      )
                    }
                  >
                    Consultar reporte
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </section>
      </div>
    </div>
  );
}