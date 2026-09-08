import {
  ArrowLeftOutlined,
  IdcardOutlined,
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
  Tag,
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

  codigo_curso: string;

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

interface ClaseDocente {
  id: number;

  grado: string;

  seccion: string;

  anio_academico: number;

  cursos: Array<{
    id: number;

    nombre: string;
  }>;
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
    seccionSeleccionada,
    setSeccionSeleccionada,
  ] =
    useState<
      number | undefined
    >(undefined);

  const [
    estudianteCreado,
    setEstudianteCreado,
  ] =
    useState<Estudiante | null>(
      null,
    );

  const [
    claseRegistrada,
    setClaseRegistrada,
  ] =
    useState<ClaseDocente | null>(
      null,
    );

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
  // NOMBRE DE LA CLASE
  // =====================================

  const obtenerNombreClase = (
    clase: {
      grado: string;

      seccion: string;

      anio_academico: number;
    },
  ) => {
    const mostrarSeccion =
      clase.seccion &&
      clase.seccion
        .toLowerCase() !==
        'general';

    return mostrarSeccion
      ? `${clase.grado} - Seccion ${clase.seccion} - ${clase.anio_academico}`
      : `${clase.grado} - ${clase.anio_academico}`;
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
            'No fue posible cargar sus clases.',
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

  // =====================================
  // AGRUPAR CLASES
  // =====================================

  const clases =
    useMemo(
      () => {
        const mapa =
          new Map<
            number,
            ClaseDocente
          >();

        asignaciones
          .filter(
            (
              item,
            ) =>
              Boolean(
                item.activo,
              ),
          )
          .forEach(
            (
              item,
            ) => {
              const seccionId =
                Number(
                  item.seccion_id,
                );

              if (
                !mapa.has(
                  seccionId,
                )
              ) {
                mapa.set(
                  seccionId,
                  {
                    id:
                      seccionId,

                    grado:
                      item.grado,

                    seccion:
                      item.seccion,

                    anio_academico:
                      item.anio_academico,

                    cursos:
                      [],
                  },
                );
              }

              const clase =
                mapa.get(
                  seccionId,
                )!;

              const existe =
                clase.cursos.some(
                  (
                    curso,
                  ) =>
                    curso.id ===
                    Number(
                      item.curso_id,
                    ),
                );

              if (!existe) {
                clase.cursos.push(
                  {
                    id:
                      Number(
                        item.curso_id,
                      ),

                    nombre:
                      item.curso,
                  },
                );
              }
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

  const claseSeleccionada =
    clases.find(
      (
        item,
      ) =>
        Number(
          item.id,
        ) ===
        Number(
          seccionSeleccionada,
        ),
    );

  // =====================================
  // LIBERAR URL DEL QR
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
    [
      qrUrl,
    ],
  );

  // =====================================
  // OBTENER QR
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
            'El estudiante fue registrado, pero no fue posible generar el QR.',
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

        setClaseRegistrada(
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

        const clase =
          clases.find(
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

        if (!clase) {
          message.error(
            'Seleccione una clase valida.',
          );

          return;
        }

        // =================================
        // CREAR ESTUDIANTE
        // =================================

        const respuestaEstudiante =
          await api.post(
            '/estudiantes',
            {
              codigo_estudiante:
                valores.codigo_estudiante
                  .trim()
                  .toUpperCase(),

              nombres:
                valores.nombres.trim(),

              apellidos:
                valores.apellidos.trim(),
            },
          );

        const estudiante:
          Estudiante =
          respuestaEstudiante
            .data
            .datos;

        // =================================
        // INSCRIBIR EN LA CLASE
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

        setEstudianteCreado(
          estudiante,
        );

        setClaseRegistrada(
          clase,
        );

        await cargarQr(
          estudiante.id,
        );

        // =================================
        // LIMPIAR DATOS DEL ALUMNO
        // PERO CONSERVAR LA CLASE
        // =================================

        form.resetFields(
          [
            'codigo_estudiante',
            'nombres',
            'apellidos',
          ],
        );

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

  // =====================================
  // CARGANDO
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
        Registre un estudiante
        y seleccione la clase a
        la que pertenece.
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
        {clases.length ===
        0 ? (
          <Alert
            type="warning"
            showIcon
            message="Primero debe crear una clase y agregarle al menos un curso."
            description="Ingrese a Mis clases para realizar la configuracion."
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
            {/* ========================= */}
            {/* CLASE */}
            {/* ========================= */}

            <Form.Item
              name="seccion_id"
              label="¿A que clase pertenece?"
              rules={[
                {
                  required:
                    true,

                  message:
                    'Seleccione la clase.',
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Seleccione la clase"
                onChange={(
                  valor,
                ) => {
                  setSeccionSeleccionada(
                    Number(
                      valor,
                    ),
                  );
                }}
                options={
                  clases.map(
                    (
                      clase,
                    ) => ({
                      value:
                        clase.id,

                      label:
                        obtenerNombreClase(
                          clase,
                        ),
                    }),
                  )
                }
              />
            </Form.Item>

            {/* ========================= */}
            {/* CURSOS DE LA CLASE */}
            {/* ========================= */}

            {claseSeleccionada && (
              <Alert
                type="info"
                showIcon
                message="Cursos incluidos en esta clase"
                description={
                  <Space
                    wrap
                    style={{
                      marginTop:
                        8,
                    }}
                  >
                    {claseSeleccionada
                      .cursos
                      .map(
                        (
                          curso,
                        ) => (
                          <Tag
                            color="blue"
                            key={
                              curso.id
                            }
                          >
                            {
                              curso.nombre
                            }
                          </Tag>
                        ),
                      )}
                  </Space>
                }
                style={{
                  marginBottom:
                    20,
                }}
              />
            )}

            {/* ========================= */}
            {/* CARNET */}
            {/* ========================= */}

            <Form.Item
              name="codigo_estudiante"
              label="Carnet o codigo del estudiante"
              extra="Ingrese el carnet que utiliza el estudiante en el establecimiento."
              rules={[
                {
                  required:
                    true,

                  message:
                    'Ingrese el carnet o codigo del estudiante.',
                },

                {
                  whitespace:
                    true,

                  message:
                    'Ingrese un carnet valido.',
                },

                {
                  max:
                    30,

                  message:
                    'El carnet no puede superar 30 caracteres.',
                },
              ]}
            >
              <Input
                size="large"
                prefix={
                  <IdcardOutlined />
                }
                placeholder="Ejemplo: 2026-001"
                maxLength={
                  30
                }
              />
            </Form.Item>

            {/* ========================= */}
            {/* NOMBRES Y APELLIDOS */}
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
            {/* REGISTRAR */}
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
              Registrar estudiante
            </Button>
          </Form>
        )}
      </Card>

      {/* ================================= */}
      {/* RESULTADO */}
      {/* ================================= */}

      {estudianteCreado &&
        claseRegistrada && (
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
              {/* ========================= */}
              {/* INFORMACION */}
              {/* ========================= */}

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
                    Carnet / codigo:
                  </Text>

                  <br />

                  <Text>
                    {
                      estudianteCreado.codigo_estudiante
                    }
                  </Text>

                  <br />
                  <br />

                  <Text strong>
                    Clase:
                  </Text>

                  <br />

                  <Text>
                    {
                      obtenerNombreClase(
                        claseRegistrada,
                      )
                    }
                  </Text>

                  <br />
                  <br />

                  <Text strong>
                    Cursos:
                  </Text>

                  <div
                    style={{
                      marginTop:
                        8,
                    }}
                  >
                    <Space wrap>
                      {claseRegistrada
                        .cursos
                        .map(
                          (
                            curso,
                          ) => (
                            <Tag
                              color="blue"
                              key={
                                curso.id
                              }
                            >
                              {
                                curso.nombre
                              }
                            </Tag>
                          ),
                        )}
                    </Space>
                  </div>

                  <br />

                  <Text
                    type="secondary"
                  >
                    El estudiante
                    queda inscrito
                    automaticamente
                    en todos los
                    cursos asociados
                    a esta clase.
                  </Text>
                </div>
              </Col>

              {/* ========================= */}
              {/* QR */}
              {/* ========================= */}

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
                      Este QR se
                      utilizara para
                      registrar la
                      asistencia del
                      estudiante.
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