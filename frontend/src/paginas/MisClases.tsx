import {
  ArrowLeftOutlined,
  BookOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  List,
  message,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';

import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import api from '../servicios/api';

const {
  Title,
  Text,
} = Typography;

interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

interface Seccion {
  id: number;
  nombre: string;
  grado: string;
  anio_academico: number;
  activo: boolean;
}

interface Asignacion {
  asignacion_id: number;
  activo: boolean;

  curso_id: number;
  codigo_curso: string;
  curso: string;

  seccion_id: number;
  seccion: string;
  grado: string;
  anio_academico: number;
}

interface FormularioAsignacion {
  curso_id: number;
  seccion_id: number;
}

export default function MisClases() {
  const navigate =
    useNavigate();

  const [
    form,
  ] =
    Form.useForm<FormularioAsignacion>();

  const [
    cursos,
    setCursos,
  ] =
    useState<Curso[]>([]);

  const [
    secciones,
    setSecciones,
  ] =
    useState<Seccion[]>([]);

  const [
    asignaciones,
    setAsignaciones,
  ] =
    useState<Asignacion[]>([]);

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    guardando,
    setGuardando,
  ] =
    useState(false);

  const obtenerMensajeError = (
    error: any,
    predeterminado: string,
  ) => {
    const respuesta =
      error.response?.data?.message;

    if (
      Array.isArray(
        respuesta,
      )
    ) {
      return respuesta.join(
        ', ',
      );
    }

    return (
      respuesta ??
      predeterminado
    );
  };

  const cargarDatos =
    async () => {
      try {
        setCargando(
          true,
        );

        const [
          respuestaCursos,
          respuestaSecciones,
          respuestaAsignaciones,
        ] =
          await Promise.all([
            api.get(
              '/cursos',
            ),

            api.get(
              '/secciones',
            ),

            api.get(
              '/asignaciones/mis-asignaciones',
            ),
          ]);

        setCursos(
          respuestaCursos.data.datos ??
            [],
        );

        setSecciones(
          respuestaSecciones.data.datos ??
            [],
        );

        setAsignaciones(
          respuestaAsignaciones.data.datos ??
            [],
        );
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar las clases.',
          ),
        );
      } finally {
        setCargando(
          false,
        );
      }
    };

  const asignarmeClase =
    async (
      valores:
        FormularioAsignacion,
    ) => {
      try {
        setGuardando(
          true,
        );

        await api.post(
          '/asignaciones/autoasignar',
          {
            curso_id:
              valores.curso_id,

            seccion_id:
              valores.seccion_id,
          },
        );

        message.success(
          'Clase asignada correctamente.',
        );

        form.resetFields();

        await cargarDatos();
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible asignar la clase.',
          ),
        );
      } finally {
        setGuardando(
          false,
        );
      }
    };

  useEffect(
    () => {
      cargarDatos();
    },
    [],
  );

  if (cargando) {
    return (
      <div
        style={{
          minHeight:
            '100vh',

          display:
            'flex',

          justifyContent:
            'center',

          alignItems:
            'center',
        }}
      >
        <Spin
          size="large"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth:
          1100,

        margin:
          '0 auto',

        padding:
          24,
      }}
    >
      <Space
        style={{
          marginBottom:
            20,
        }}
      >
        <Button
          icon={
            <ArrowLeftOutlined />
          }
          onClick={() =>
            navigate(
              '/docente',
            )
          }
        >
          Regresar
        </Button>

        <Button
          icon={
            <ReloadOutlined />
          }
          onClick={
            cargarDatos
          }
        >
          Actualizar
        </Button>
      </Space>

      <Title level={2}>
        Mis clases
      </Title>

      <Text
        type="secondary"
      >
        Consulte sus clases y
        asigne los cursos y
        secciones que imparte.
      </Text>

      <Card
        title={
          <Space>
            <BookOutlined />

            Clases asignadas
          </Space>
        }
        style={{
          marginTop:
            24,

          marginBottom:
            24,
        }}
      >
        {asignaciones.length ===
        0 ? (
          <Alert
            type="info"
            showIcon
            message="Todavia no tiene clases asignadas."
          />
        ) : (
          <List
            dataSource={
              asignaciones
            }
            renderItem={(
              item,
            ) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    item.curso
                  }
                  description={
                    `${item.codigo_curso} | ${item.grado} - Seccion ${item.seccion} | ${item.anio_academico}`
                  }
                />

                <Tag
                  color="green"
                >
                  ACTIVA
                </Tag>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card
        title={
          <Space>
            <PlusOutlined />

            Asignarme una clase
          </Space>
        }
      >
        <Alert
          type="info"
          showIcon
          message="Seleccione un curso y una seccion creados previamente por el administrador."
          style={{
            marginBottom:
              20,
          }}
        />

        <Form
          form={
            form
          }
          layout="vertical"
          onFinish={
            asignarmeClase
          }
        >
          <Row
            gutter={[
              16,
              0,
            ]}
          >
            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="curso_id"
                label="Curso"
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Seleccione un curso.',
                  },
                ]}
              >
                <Select
                  placeholder="Seleccione un curso"
                  options={
                    cursos
                      .filter(
                        (
                          curso,
                        ) =>
                          Boolean(
                            curso.activo,
                          ),
                      )
                      .map(
                        (
                          curso,
                        ) => ({
                          value:
                            curso.id,

                          label:
                            `${curso.codigo} - ${curso.nombre}`,
                        }),
                      )
                  }
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="seccion_id"
                label="Seccion"
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Seleccione una seccion.',
                  },
                ]}
              >
                <Select
                  placeholder="Seleccione una seccion"
                  options={
                    secciones
                      .filter(
                        (
                          seccion,
                        ) =>
                          Boolean(
                            seccion.activo,
                          ),
                      )
                      .map(
                        (
                          seccion,
                        ) => ({
                          value:
                            seccion.id,

                          label:
                            `${seccion.grado} - Seccion ${seccion.nombre} - ${seccion.anio_academico}`,
                        }),
                      )
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={
              <PlusOutlined />
            }
            loading={
              guardando
            }
          >
            Asignarme clase
          </Button>
        </Form>
      </Card>
    </div>
  );
}