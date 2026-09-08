import {
  ApartmentOutlined,
  BookOutlined,
  LogoutOutlined,
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
            Panel de Administracion
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
        {/* ESTUDIANTES */}

        <Col
          xs={24}
          sm={12}
          lg={8}
        >
          <Card
            hoverable
            className="dashboard-card"
            onClick={() =>
              navigate(
                '/admin/estudiantes',
              )
            }
          >
            <UserOutlined
              className="dashboard-icono"
            />

            <Title level={4}>
              Estudiantes
            </Title>

            <Text
              type="secondary"
            >
              Registrar estudiantes y asignar su clase.
            </Text>
          </Card>
        </Col>

        {/* DOCENTES */}

        <Col
          xs={24}
          sm={12}
          lg={8}
        >
          <Card
            hoverable
            className="dashboard-card"
            onClick={() =>
              navigate(
                '/admin/docentes',
              )
            }
          >
            <TeamOutlined
              className="dashboard-icono"
            />

            <Title level={4}>
              Docentes
            </Title>

            <Text
              type="secondary"
            >
              Gestionar docentes del establecimiento.
            </Text>
          </Card>
        </Col>

        {/* CLASES */}

        <Col
          xs={24}
          sm={12}
          lg={8}
        >
          <Card
            hoverable
            className="dashboard-card"
            onClick={() =>
              navigate(
                '/admin/secciones',
              )
            }
          >
            <ReadOutlined
              className="dashboard-icono"
            />

            <Title level={4}>
              Clases
            </Title>

            <Text
              type="secondary"
            >
              Administrar grados, secciones y ciclos.
            </Text>
          </Card>
        </Col>

        {/* CURSOS */}

        <Col
          xs={24}
          sm={12}
          lg={8}
        >
          <Card
            hoverable
            className="dashboard-card"
            onClick={() =>
              navigate(
                '/admin/cursos',
              )
            }
          >
            <BookOutlined
              className="dashboard-icono"
            />

            <Title level={4}>
              Cursos
            </Title>

            <Text
              type="secondary"
            >
              Crear y administrar los cursos.
            </Text>
          </Card>
        </Col>

        {/* CURSOS POR CLASE */}

        <Col
          xs={24}
          sm={12}
          lg={8}
        >
          <Card
            hoverable
            className="dashboard-card"
            onClick={() =>
              navigate(
                '/admin/cursos-clases',
              )
            }
          >
            <ApartmentOutlined
              className="dashboard-icono"
            />

            <Title level={4}>
              Cursos por clase
            </Title>

            <Text
              type="secondary"
            >
              ASigna cursos a las clases.
            </Text>
          </Card>
        </Col>

        {/* ASIGNACIONES */}

        <Col
          xs={24}
          sm={12}
          lg={8}
        >
          <Card
            hoverable
            className="dashboard-card"
            onClick={() =>
              navigate(
                '/admin/asignaciones',
              )
            }
          >
            <SolutionOutlined
              className="dashboard-icono"
            />

            <Title level={4}>
              Asignaciones
            </Title>

            <Text
              type="secondary"
            >
              Asignar clases completas a los docentes.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}