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
    <div className="dashboard-pagina">
      <div className="dashboard-encabezado">
        <div>
          <Title
            level={2}
            style={{
              marginBottom:
                4,
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
        <Col
          xs={24}
          md={8}
        >
          <Card>
            <BookOutlined className="dashboard-icono" />

            <Title
              level={4}
            >
              Mis clases
            </Title>

            <Text
              type="secondary"
            >
              Consulte sus clases
              y asigne cursos y
              secciones.
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
                Gestionar clases
              </Button>
            </div>
          </Card>
        </Col>

        <Col
          xs={24}
          md={8}
        >
          <Card>
            <UserAddOutlined className="dashboard-icono" />

            <Title
              level={4}
            >
              Estudiantes
            </Title>

            <Text
              type="secondary"
            >
              Registre estudiantes
              en las secciones que
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

        <Col
          xs={24}
          md={8}
        >
          <Card>
            <QrcodeOutlined className="dashboard-icono" />

            <Title
              level={4}
            >
              Tomar asistencia
            </Title>

            <Text
              type="secondary"
            >
              Escanee los QR de
              los estudiantes con
              la camara.
            </Text>

            <div
              style={{
                marginTop:
                  20,
              }}
            >
              <Button
                block
                disabled
              >
                Proxima etapa
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}