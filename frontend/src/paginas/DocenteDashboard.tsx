import {
  BookOutlined,
  HistoryOutlined,
  LogoutOutlined,
  QrcodeOutlined,
  UserAddOutlined,
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

export default function DocenteDashboard() {
  const navigate =
    useNavigate();

  const {
    usuario,
    cerrarSesion,
  } =
    useAutenticacion();

  // =====================================
  // CERRAR SESION
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
              Docente
            </span>

            <Title
              level={2}
              className="dashboard-titulo"
            >
              Bienvenido
            </Title>

            <Text
              className="dashboard-bienvenida"
            >
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
        {/* ACCION PRINCIPAL */}
        {/* ================================= */}

        <Card
          className="dashboard-accion-principal"
        >
          <span
            className="dashboard-accion-etiqueta"
          >
            Acción principal
          </span>

          <Title
            level={3}
            className="dashboard-accion-titulo"
          >
            Tomar asistencia
          </Title>

          <Text
            className="dashboard-accion-texto"
          >
            Seleccione su clase y
            curso, abra la cámara y
            registre la asistencia de
            los estudiantes mediante
            su código QR.
          </Text>

          <Button
            size="large"
            icon={
              <QrcodeOutlined />
            }
            className="dashboard-accion-boton"
            onClick={() =>
              navigate(
                '/docente/asistencia',
              )
            }
          >
            Iniciar asistencia
          </Button>
        </Card>

        {/* ================================= */}
        {/* HERRAMIENTAS */}
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
              Herramientas
            </Title>

            <Text
              className="dashboard-seccion-texto"
            >
              Acceda a la información
              que necesita para
              trabajar con sus clases.
            </Text>
          </div>

          <Row
            gutter={[
              16,
              16,
            ]}
          >
            {/* MIS CLASES */}

            <Col
              xs={24}
              md={8}
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
                  Mis clases
                </Title>

                <Text
                  className="dashboard-card-texto"
                >
                  Consulte las clases
                  y cursos que tiene
                  asignados.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    block
                    onClick={() =>
                      navigate(
                        '/docente/clases',
                      )
                    }
                  >
                    Ver mis clases
                  </Button>
                </div>
              </Card>
            </Col>

            {/* ESTUDIANTES */}

            <Col
              xs={24}
              md={8}
            >
              <Card
                className="dashboard-card"
              >
                <div
                  className="dashboard-card-icono"
                >
                  <UserAddOutlined />
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
                  Registre estudiantes
                  dentro de las clases
                  que tiene asignadas.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    block
                    onClick={() =>
                      navigate(
                        '/docente/estudiantes',
                      )
                    }
                  >
                    Ver estudiantes
                  </Button>
                </div>
              </Card>
            </Col>

            {/* HISTORIAL */}

            <Col
              xs={24}
              md={8}
            >
              <Card
                className="dashboard-card"
              >
                <div
                  className="dashboard-card-icono"
                >
                  <HistoryOutlined />
                </div>

                <Title
                  level={4}
                  className="dashboard-card-titulo"
                >
                  Historial de asistencia
                </Title>

                <Text
                  className="dashboard-card-texto"
                >
                  Consulte sesiones
                  anteriores, presentes,
                  ausentes, fechas y
                  horarios.
                </Text>

                <div
                  className="dashboard-card-accion"
                >
                  <Button
                    block
                    onClick={() =>
                      navigate(
                        '/docente/historial-asistencias',
                      )
                    }
                  >
                    Consultar historial
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