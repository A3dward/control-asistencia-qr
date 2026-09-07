import {
  ArrowLeftOutlined,
  QrcodeOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';

import {
  useEffect,
  useMemo,
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

interface Asignacion {
  asignacion_id: number;
  activo: boolean;

  curso_id: number;
  curso: string;

  seccion_id: number;
  seccion: string;

  grado: string;
  anio_academico: number;
}

interface Estudiante {
  id: number;
  codigo_estudiante: string;
  nombres: string;
  apellidos: string;
}

interface FormularioEstudiante {
  seccion_id: number;

  codigo_estudiante: string;

  nombres: string;

  apellidos: string;
}

export default function EstudiantesDocente() {
  const navigate =
    useNavigate();

  const [
    form,
  ] =
    Form.useForm<FormularioEstudiante>();

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

  const [
    estudianteCreado,
    setEstudianteCreado,
  ] =
    useState<Estudiante | null>(
      null,
    );

  const [
    qrUrl,
    setQrUrl,
  ] =
    useState<string | null>(
      null,
    );

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

  const cargarAsignaciones =
    async () => {
      try {
        setCargando(
          true,
        );

        const respuesta =
          await api.get(
            '/asignaciones/mis-asignaciones',
          );

        setAsignaciones(
          respuesta.data.datos ??
            [],
        );
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar sus secciones.',
          ),
        );
      } finally {
        setCargando(
          false,
        );
      }
    };

  useEffect(
    () => {
      cargarAsignaciones();
    },
    [],
  );

  useEffect(
    () => {
      return () => {
        if (qrUrl) {
          URL.revokeObjectURL(
            qrUrl,
          );
        }
      };
    },
    [qrUrl],
  );

  const seccionesPropias =
    useMemo(
      () => {
        const mapa =
          new Map<
            number,
            {
              id: number;
              nombre: string;
              grado: string;
              anio_academico: number;
            }
          >();

        asignaciones
          .filter(
            (
              asignacion,
            ) =>
              Boolean(
                asignacion.activo,
              ),
          )
          .forEach(
            (
              asignacion,
            ) => {
              mapa.set(
                Number(
                  asignacion.seccion_id,
                ),
                {
                  id:
                    Number(
                      asignacion.seccion_id,
                    ),

                  nombre:
                    asignacion.seccion,

                  grado:
                    asignacion.grado,

                  anio_academico:
                    asignacion.anio_academico,
                },
              );
            },
          );

        return Array.from(
          mapa.values(),
        );
      },
      [
        asignaciones,
      ],
    );

  const cargarQr =
    async (
      estudianteId:
        number,
    ) => {
      try {
        const respuesta =
          await api.get(
            `/estudiantes/${estudianteId}/qr`,
            {
              responseType:
                'blob',
            },
          );

        if (qrUrl) {
          URL.revokeObjectURL(
            qrUrl,
          );
        }

        const nuevaUrl =
          URL.createObjectURL(
            respuesta.data,
          );

        setQrUrl(
          nuevaUrl,
        );
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible obtener el QR.',
          ),
        );
      }
    };

  const registrarEstudiante =
    async (
      valores:
        FormularioEstudiante,
    ) => {
      try {
        setGuardando(
          true,
        );

        setEstudianteCreado(
          null,
        );

        if (qrUrl) {
          URL.revokeObjectURL(
            qrUrl,
          );

          setQrUrl(
            null,
          );
        }

        const respuestaEstudiante =
          await api.post(
            '/estudiantes',
            {
              codigo_estudiante:
                valores.codigo_estudiante,

              nombres:
                valores.nombres,

              apellidos:
                valores.apellidos,
            },
          );

        const estudiante:
          Estudiante =
          respuestaEstudiante
            .data
            .datos;

        await api.post(
          '/inscripciones/mi-seccion',
          {
            estudiante_id:
              Number(
                estudiante.id,
              ),

            seccion_id:
              Number(
                valores.seccion_id,
              ),
          },
        );

        setEstudianteCreado(
          estudiante,
        );

        await cargarQr(
          estudiante.id,
        );

        form.resetFields();

        message.success(
          'Estudiante registrado correctamente.',
        );
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible registrar el estudiante.',
          ),
        );
      } finally {
        setGuardando(
          false,
        );
      }
    };

  if (cargando) {
    return (
      <div
        style={{
          minHeight:
            '100vh',

          display:
            'flex',

          alignItems:
            'center',

          justifyContent:
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
          1000,

        margin:
          '0 auto',

        padding:
          24,
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
        style={{
          marginBottom:
            20,
        }}
      >
        Regresar
      </Button>

      <Title level={2}>
        Estudiantes
      </Title>

      <Text
        type="secondary"
      >
        Registre estudiantes
        dentro de las secciones
        que tiene asignadas.
      </Text>

      <Card
        title={
          <Space>
            <UserAddOutlined />

            Registrar estudiante
          </Space>
        }
        style={{
          marginTop:
            24,
        }}
      >
        {seccionesPropias.length ===
        0 ? (
          <Alert
            type="warning"
            showIcon
            message="No tiene secciones asignadas."
            description="Primero ingrese a Mis clases y asignese una clase."
          />
        ) : (
          <Form
            form={
              form
            }
            layout="vertical"
            onFinish={
              registrarEstudiante
            }
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
                placeholder="Seleccione una de sus secciones"
                options={
                  seccionesPropias.map(
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

            <Form.Item
              name="codigo_estudiante"
              label="Codigo del estudiante"
              rules={[
                {
                  required:
                    true,

                  message:
                    'Ingrese el codigo del estudiante.',
                },
              ]}
            >
              <Input
                placeholder="Ejemplo: EST002"
                maxLength={
                  30
                }
              />
            </Form.Item>

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
                  name="nombres"
                  label="Nombres"
                  rules={[
                    {
                      required:
                        true,

                      message:
                        'Ingrese los nombres.',
                    },
                  ]}
                >
                  <Input
                    placeholder="Nombres"
                    maxLength={
                      100
                    }
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <Form.Item
                  name="apellidos"
                  label="Apellidos"
                  rules={[
                    {
                      required:
                        true,

                      message:
                        'Ingrese los apellidos.',
                    },
                  ]}
                >
                  <Input
                    placeholder="Apellidos"
                    maxLength={
                      100
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Button
              type="primary"
              htmlType="submit"
              icon={
                <UserAddOutlined />
              }
              loading={
                guardando
              }
            >
              Registrar estudiante
            </Button>
          </Form>
        )}
      </Card>

      {estudianteCreado && (
        <Card
          title="Estudiante registrado"
          style={{
            marginTop:
              24,
          }}
        >
          <Row
            gutter={[
              24,
              24,
            ]}
          >
            <Col
              xs={24}
              md={14}
            >
              <Alert
                type="success"
                showIcon
                message="Registro completado"
                description={
                  `${estudianteCreado.nombres} ${estudianteCreado.apellidos}`
                }
              />

              <div
                style={{
                  marginTop:
                    20,
                }}
              >
                <Text strong>
                  Codigo:{' '}
                </Text>

                <Text>
                  {
                    estudianteCreado.codigo_estudiante
                  }
                </Text>
              </div>
            </Col>

            <Col
              xs={24}
              md={10}
              style={{
                textAlign:
                  'center',
              }}
            >
              {qrUrl && (
                <>
                  <Space>
                    <QrcodeOutlined />

                    <Text strong>
                      QR del estudiante
                    </Text>
                  </Space>

                  <div
                    style={{
                      marginTop:
                        15,
                    }}
                  >
                    <Image
                      src={
                        qrUrl
                      }
                      width={
                        220
                      }
                      preview
                    />
                  </div>
                </>
              )}
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}