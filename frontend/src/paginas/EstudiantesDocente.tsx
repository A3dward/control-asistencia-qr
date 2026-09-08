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

// =====================================
// INTERFACES
// =====================================

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

  nombres: string;

  apellidos: string;
}

// =====================================
// COMPONENTE
// =====================================

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
    seccionRegistrada,
    setSeccionRegistrada,
  ] =
    useState<string>('');

  const [
    qrUrl,
    setQrUrl,
  ] =
    useState<string | null>(
      null,
    );

  // =====================================
  // MENSAJE DE ERROR
  // =====================================

  const obtenerMensajeError = (
    error: any,
    predeterminado: string,
  ) => {
    const respuesta =
      error.response
        ?.data
        ?.message;

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

  // =====================================
  // CARGAR ASIGNACIONES DEL DOCENTE
  // =====================================

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
          respuesta.data
            .datos ?? [],
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

  // =====================================
  // CARGAR AL INICIAR
  // =====================================

  useEffect(
    () => {
      cargarAsignaciones();
    },
    [],
  );

  // =====================================
  // LIBERAR IMAGEN QR
  // =====================================

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

  // =====================================
  // OBTENER SECCIONES UNICAS
  // =====================================

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

  // =====================================
  // OBTENER QR DEL ESTUDIANTE
  // =====================================

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
            'El estudiante fue registrado, pero no fue posible obtener el QR.',
          ),
        );
      }
    };

  // =====================================
  // REGISTRAR ESTUDIANTE
  // =====================================

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

        setSeccionRegistrada(
          '',
        );

        if (qrUrl) {
          URL.revokeObjectURL(
            qrUrl,
          );

          setQrUrl(
            null,
          );
        }

        // =================================
        // BUSCAR NOMBRE DE LA SECCION
        // =================================

        const seccion =
          seccionesPropias.find(
            (
              item,
            ) =>
              Number(
                item.id,
              ) ===
              Number(
                valores.seccion_id,
              ),
          );

        // =================================
        // CREAR ESTUDIANTE
        // EL CODIGO LO GENERA EL BACKEND
        // =================================

        const respuestaEstudiante =
          await api.post(
            '/estudiantes',
            {
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

        // =================================
        // INSCRIBIR EN SECCION
        // =================================

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

        // =================================
        // GUARDAR RESULTADO
        // =================================

        setEstudianteCreado(
          estudiante,
        );

        if (seccion) {
          setSeccionRegistrada(
            `${seccion.grado} - Seccion ${seccion.nombre}`,
          );
        }

        // =================================
        // CARGAR QR
        // =================================

        await cargarQr(
          estudiante.id,
        );

        form.resetFields();

        message.success(
          'Estudiante registrado e inscrito correctamente.',
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

  // =====================================
  // PANTALLA DE CARGA
  // =====================================

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

  // =====================================
  // VISTA
  // =====================================

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
      {/* ================================= */}
      {/* REGRESAR */}
      {/* ================================= */}

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

      {/* ================================= */}
      {/* TITULO */}
      {/* ================================= */}

      <Title level={2}>
        Estudiantes
      </Title>

      <Text
        type="secondary"
      >
        Registre nuevos
        estudiantes dentro de
        las secciones que tiene
        asignadas.
      </Text>

      {/* ================================= */}
      {/* FORMULARIO */}
      {/* ================================= */}

      <Card
        title={
          <Space>
            <UserAddOutlined />

            Registrar nuevo estudiante
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
          <>
            <Alert
              type="info"
              showIcon
              message="Registro sencillo"
              description="Ingrese los datos del estudiante. El sistema generara automaticamente su codigo interno y su codigo QR."
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
                registrarEstudiante
              }
            >
              {/* ========================= */}
              {/* SECCION */}
              {/* ========================= */}

              <Form.Item
                name="seccion_id"
                label="Seccion del estudiante"
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
                  size="large"
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

              {/* ========================= */}
              {/* NOMBRES / APELLIDOS */}
              {/* ========================= */}

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

                      {
                        whitespace:
                          true,

                        message:
                          'Ingrese nombres validos.',
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Ejemplo: Juan Carlos"
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

                      {
                        whitespace:
                          true,

                        message:
                          'Ingrese apellidos validos.',
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Ejemplo: Perez Lopez"
                      maxLength={
                        100
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* ========================= */}
              {/* BOTON */}
              {/* ========================= */}

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={
                  <UserAddOutlined />
                }
                loading={
                  guardando
                }
              >
                Registrar y generar QR
              </Button>
            </Form>
          </>
        )}
      </Card>

      {/* ================================= */}
      {/* RESULTADO */}
      {/* ================================= */}

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
            {/* =========================== */}
            {/* INFORMACION */}
            {/* =========================== */}

            <Col
              xs={24}
              md={14}
            >
              <Alert
                type="success"
                showIcon
                message="Registro completado correctamente"
                description={
                  `${estudianteCreado.nombres} ${estudianteCreado.apellidos}`
                }
              />

              <div
                style={{
                  marginTop:
                    24,
                }}
              >
                <Text strong>
                  Estudiante:
                </Text>

                <br />

                <Text>
                  {
                    estudianteCreado.nombres
                  }{' '}
                  {
                    estudianteCreado.apellidos
                  }
                </Text>

                <br />
                <br />

                <Text strong>
                  Seccion:
                </Text>

                <br />

                <Text>
                  {
                    seccionRegistrada
                  }
                </Text>

                <br />
                <br />

                <Text strong>
                  Codigo interno:
                </Text>

                <br />

                <Text>
                  {
                    estudianteCreado.codigo_estudiante
                  }
                </Text>

                <br />

                <Text
                  type="secondary"
                >
                  Este codigo es
                  generado
                  automaticamente por
                  el sistema.
                </Text>
              </div>
            </Col>

            {/* =========================== */}
            {/* QR */}
            {/* =========================== */}

            <Col
              xs={24}
              md={10}
              style={{
                textAlign:
                  'center',
              }}
            >
              {qrUrl ? (
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

                  <Text
                    type="secondary"
                  >
                    Este QR puede
                    imprimirse y
                    utilizarse para
                    registrar la
                    asistencia.
                  </Text>
                </>
              ) : (
                <Spin />
              )}
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}