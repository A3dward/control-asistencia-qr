import {
  BookOutlined,
  LogoutOutlined,
  QrcodeOutlined,
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
        replace: true,
      },
    );
  };

  return (
    <div className="dashboard-pagina">
      <div className="dashboard-encabezado">
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 4,
            }}
          >
            Panel del Docente
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
          onClick={salir}
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
        <Col
          xs={24}
          md={12}
        >
          <Card>
            <BookOutlined className="dashboard-icono" />

            <Title level={4}>
              Mis clases
            </Title>

            <Text
              type="secondary"
            >
              Consultar los cursos
              y secciones que tiene
              asignados.
            </Text>
          </Card>
        </Col>

        <Col
          xs={24}
          md={12}
        >
          <Card>
            <QrcodeOutlined className="dashboard-icono" />

            <Title level={4}>
              Tomar asistencia
            </Title>

            <Text
              type="secondary"
            >
              Iniciar una clase y
              registrar estudiantes
              mediante codigo QR.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}