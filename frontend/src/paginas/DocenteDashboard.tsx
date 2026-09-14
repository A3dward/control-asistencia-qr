import {
  BookOutlined,
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

  const salir = () => {
    cerrarSesion();

    navigate(
      '/login',
      {
        replace:
          true,
      },
    );
  };

  return (
    <div
      className="dashboard-pagina"
    >
      {/* ================================= */}
      {/* ENCABEZADO */}
      {/* ================================= */}

      <div
        className="dashboard-encabezado"
      >
        <div>
          <Title
            level={2}
            style={{
              marginBottom:
                4,
            }}
          >
            Docente
          </Title>

          <Text
            type="secondary"
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
          Cerrar sesion
        </Button>
      </div>

      <Row
        gutter={[
          16,
          16,
        ]}
      >
        {/* ================================= */}
        {/* MIS CLASES */}
        {/* ================================= */}

        <Col
          xs={24}
          md={8}
        >
          <Card
            hoverable
          >
            <BookOutlined
              className="dashboard-icono"
            />

            <Title
              level={4}
            >
              Mis clases
            </Title>

            <Text
              type="secondary"
            >
              Consulte las clases
              y cursos que tiene
              asignados.
            </Text>

            <div
              style={{
                marginTop:
                  20,
              }}
            >
              <Button
                type="primary"
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

        {/* ================================= */}
        {/* ESTUDIANTES */}
        {/* ================================= */}

        <Col
          xs={24}
          md={8}
        >
          <Card
            hoverable
          >
            <UserAddOutlined
              className="dashboard-icono"
            />

            <Title
              level={4}
            >
              Estudiantes
            </Title>

            <Text
              type="secondary"
            >
              Registre estudiantes
              en las clases que
              tiene asignadas.
            </Text>

            <div
              style={{
                marginTop:
                  20,
              }}
            >
              <Button
                type="primary"
                block
                onClick={() =>
                  navigate(
                    '/docente/estudiantes',
                  )
                }
              >
                Registrar estudiante
              </Button>
            </div>
          </Card>
        </Col>

        {/* ================================= */}
        {/* TOMAR ASISTENCIA */}
        {/* ================================= */}

        <Col
          xs={24}
          md={8}
        >
          <Card
            hoverable
          >
            <QrcodeOutlined
              className="dashboard-icono"
            />

            <Title
              level={4}
            >
              Tomar asistencia
            </Title>

            <Text
              type="secondary"
            >
              Seleccione clase y
              curso para registrar
              asistencia mediante QR.
            </Text>

            <div
              style={{
                marginTop:
                  20,
              }}
            >
              <Button
                type="primary"
                block
                icon={
                  <QrcodeOutlined />
                }
                onClick={() =>
                  navigate(
                    '/docente/asistencia',
                  )
                }
              >
                Tomar asistencia
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}