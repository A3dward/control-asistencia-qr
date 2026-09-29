import {
  ArrowLeftOutlined,
  IdcardOutlined,
  QrcodeOutlined,
  TeamOutlined,
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
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';

import type {
  TableColumnsType,
} from 'antd';

import axios from 'axios';

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
  asignacion_id:
    number;

  activo:
    boolean;

  curso_id:
    number;

  curso:
    string;

  codigo_curso:
    string;

  seccion_id:
    number;

  seccion:
    string;

  grado:
    string;

  anio_academico:
    number;
}

interface Estudiante {
  id:
    number;

  codigo_estudiante:
    string;

  nombres:
    string;

  apellidos:
    string;
}

interface EstudianteClase {
  inscripcion_id:
    number;

  estudiante_id:
    number;

  codigo_estudiante:
    string;

  nombres:
    string;

  apellidos:
    string;

  activo:
    boolean;

  estudiante_activo:
    boolean;
}

interface FormularioEstudiante {
  seccion_id:
    number;

  codigo_estudiante:
    string;

  nombres:
    string;

  apellidos:
    string;
}

interface ClaseDocente {
  id:
    number;

  grado:
    string;

  seccion:
    string;

  anio_academico:
    number;

  cursos:
    Array<{
      id:
        number;

      nombre:
        string;
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

  // =====================================
  // DATOS GENERALES
  // =====================================

  const [
    asignaciones,
    setAsignaciones,
  ] =
    useState<
      Asignacion[]
    >([]);

  const [
    estudiantesClase,
    setEstudiantesClase,
  ] =
    useState<
      EstudianteClase[]
    >([]);

  // =====================================
  // CLASES SELECCIONADAS
  // =====================================

  const [
    seccionConsulta,
    setSeccionConsulta,
  ] =
    useState<
      number | undefined
    >(undefined);

  const [
    seccionRegistro,
    setSeccionRegistro,
  ] =
    useState<
      number | undefined
    >(undefined);

  // =====================================
  // REGISTRO
  // =====================================

  const [
    estudianteCreado,
    setEstudianteCreado,
  ] =
    useState<
      Estudiante | null
    >(null);

  const [
    claseRegistrada,
    setClaseRegistrada,
  ] =
    useState<
      ClaseDocente | null
    >(null);

  // =====================================
  // QR
  // =====================================

  const [
    qrUrl,
    setQrUrl,
  ] =
    useState<
      string | null
    >(null);

  const [
    estudianteQr,
    setEstudianteQr,
  ] =
    useState<
      EstudianteClase | Estudiante | null
    >(null);

  const [
    modalQrAbierto,
    setModalQrAbierto,
  ] =
    useState(false);

  const [
    cargandoQr,
    setCargandoQr,
  ] =
    useState(false);

  // =====================================
  // ESTADOS
  // =====================================

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    cargandoEstudiantes,
    setCargandoEstudiantes,
  ] =
    useState(false);

  const [
    guardando,
    setGuardando,
  ] =
    useState(false);

  // =====================================
  // MENSAJE DE ERROR
  // =====================================

  const obtenerMensajeError = (
    error:
      unknown,

    predeterminado:
      string,
  ) => {
    if (
      axios.isAxiosError(
        error,
      )
    ) {
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
    }

    if (
      error instanceof
      Error
    ) {
      return (
        error.message ||
        predeterminado
      );
    }

    return predeterminado;
  };

  // =====================================
  // NOMBRE DE LA CLASE
  // =====================================

  const obtenerNombreClase = (
    clase: {
      grado:
        string;

      seccion:
        string;

      anio_academico:
        number;
    },
  ) => {
    const mostrarSeccion =
      clase.seccion &&
      clase.seccion
        .toLowerCase() !==
        'general';

    return mostrarSeccion
      ? `${clase.grado} - Sección ${clase.seccion} - ${clase.anio_academico}`
      : `${clase.grado} - ${clase.anio_academico}`;
  };

  // =====================================
  // CARGAR ASIGNACIONES
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

        const datos =
          respuesta.data
            .datos ?? [];

        const normalizados:
          Asignacion[] =
          datos.map(
            (
              asignacion:
                any,
            ) => ({
              ...asignacion,

              asignacion_id:
                Number(
                  asignacion.asignacion_id,
                ),

              curso_id:
                Number(
                  asignacion.curso_id,
                ),

              seccion_id:
                Number(
                  asignacion.seccion_id,
                ),

              anio_academico:
                Number(
                  asignacion.anio_academico,
                ),

              activo:
                Boolean(
                  asignacion.activo,
                ),
            }),
          );

        setAsignaciones(
          normalizados,
        );
      } catch (
        error
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

  // =====================================
  // INICIO
  // =====================================

  useEffect(
    () => {
      void cargarAsignaciones();
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
                      Number(
                        item.anio_academico,
                      ),

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

  // =====================================
  // CLASE DE REGISTRO
  // =====================================

  const claseRegistro =
    useMemo(
      () =>
        clases.find(
          (
            clase,
          ) =>
            Number(
              clase.id,
            ) ===
              Number(
                seccionRegistro,
              ),
        ) ??
        null,
      [
        clases,
        seccionRegistro,
      ],
    );

  // =====================================
  // CLASE DE CONSULTA
  // =====================================

  const claseConsulta =
    useMemo(
      () =>
        clases.find(
          (
            clase,
          ) =>
            Number(
              clase.id,
            ) ===
              Number(
                seccionConsulta,
              ),
        ) ??
        null,
      [
        clases,
        seccionConsulta,
      ],
    );

  // =====================================
  // CARGAR ESTUDIANTES DE CLASE
  // =====================================

  const cargarEstudiantesClase =
    async (
      seccionId:
        number,
    ) => {
      try {
        setCargandoEstudiantes(
          true,
        );

        setEstudiantesClase(
          [],
        );

        const respuesta =
          await api.get(
            `/inscripciones/mi-seccion/${seccionId}`,
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const normalizados:
          EstudianteClase[] =
          datos.map(
            (
              estudiante:
                any,
            ) => ({
              inscripcion_id:
                Number(
                  estudiante.inscripcion_id,
                ),

              estudiante_id:
                Number(
                  estudiante.estudiante_id,
                ),

              codigo_estudiante:
                estudiante.codigo_estudiante,

              nombres:
                estudiante.nombres,

              apellidos:
                estudiante.apellidos,

              activo:
                Boolean(
                  estudiante.activo,
                ),

              estudiante_activo:
                Boolean(
                  estudiante.estudiante_activo,
                ),
            }),
          );

        setEstudiantesClase(
          normalizados,
        );
      } catch (
        error
      ) {
        setEstudiantesClase(
          [],
        );

        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar los estudiantes de la clase.',
          ),
        );
      } finally {
        setCargandoEstudiantes(
          false,
        );
      }
    };

  // =====================================
  // LIMPIAR URL QR
  // =====================================

  const liberarQr =
    () => {
      if (qrUrl) {
        URL.revokeObjectURL(
          qrUrl,
        );

        setQrUrl(
          null,
        );
      }
    };

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
  // MOSTRAR QR
  // =====================================

  const verQr =
    async (
      estudiante:
        EstudianteClase | Estudiante,

      seccionId:
        number,
    ) => {
      try {
        setEstudianteQr(
          estudiante,
        );

        setModalQrAbierto(
          true,
        );

        setCargandoQr(
          true,
        );

        liberarQr();

        const estudianteId =
          'estudiante_id' in
          estudiante
            ? estudiante.estudiante_id
            : estudiante.id;

        const respuesta =
          await api.get(
            `/inscripciones/mi-seccion/${seccionId}/estudiante/${estudianteId}/qr`,
            {
              responseType:
                'blob',
            },
          );

        const nuevaUrl =
          URL.createObjectURL(
            respuesta.data,
          );

        setQrUrl(
          nuevaUrl,
        );
      } catch (
        error
      ) {
        setModalQrAbierto(
          false,
        );

        message.error(
          obtenerMensajeError(
            error,
            'No fue posible obtener el QR del estudiante.',
          ),
        );
      } finally {
        setCargandoQr(
          false,
        );
      }
    };

  // =====================================
  // CERRAR QR
  // =====================================

  const cerrarQr =
    () => {
      setModalQrAbierto(
        false,
      );

      setEstudianteQr(
        null,
      );

      liberarQr();
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
            'Seleccione una clase válida.',
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
          {
            ...respuestaEstudiante
              .data
              .datos,

            id:
              Number(
                respuestaEstudiante
                  .data
                  .datos
                  .id,
              ),
          };

        // =================================
        // INSCRIBIR EN CLASE
        // =================================

        await api.post(
          '/inscripciones/mi-seccion',
          {
            estudiante_id:
              estudiante.id,

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

        // =================================
        // SI ESTA CONSULTANDO ESA
        // MISMA CLASE, ACTUALIZAR LISTA
        // =================================

        if (
          Number(
            seccionConsulta,
          ) ===
          Number(
            valores.seccion_id,
          )
        ) {
          await cargarEstudiantesClase(
            Number(
              valores.seccion_id,
            ),
          );
        }

        // =================================
        // LIMPIAR DATOS
        // CONSERVANDO CLASE
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
        error
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
  // COLUMNAS ESTUDIANTES
  // =====================================

  const columnas:
    TableColumnsType<EstudianteClase> =
    [
      {
        title:
          'Carnet',

        dataIndex:
          'codigo_estudiante',

        key:
          'codigo_estudiante',

        width:
          170,

        render: (
          codigo:
            string,
        ) => (
          <Space>
            <IdcardOutlined />

            <Text>
              {codigo}
            </Text>
          </Space>
        ),
      },

      {
        title:
          'Estudiante',

        key:
          'estudiante',

        render: (
          _,
          estudiante,
        ) => (
          <div>
            <Text strong>
              {
                estudiante.nombres
              }{' '}
              {
                estudiante.apellidos
              }
            </Text>

            <br />

            <Text
              type="secondary"
              style={{
                fontSize:
                  12,
              }}
            >
              Estudiante activo
            </Text>
          </div>
        ),
      },

      {
        title:
          'Estado',

        key:
          'estado',

        width:
          120,

        align:
          'center',

        render: () => (
          <Tag
            color="green"
          >
            ACTIVO
          </Tag>
        ),
      },

      {
        title:
          'Código QR',

        key:
          'qr',

        width:
          150,

        align:
          'center',

        render: (
          _,
          estudiante,
        ) => (
          <Button
            icon={
              <QrcodeOutlined />
            }
            onClick={() => {
              if (
                !seccionConsulta
              ) {
                return;
              }

              void verQr(
                estudiante,
                seccionConsulta,
              );
            }}
          >
            Ver QR
          </Button>
        ),
      },
    ];

  // =====================================
  // CARGANDO
  // =====================================

  if (cargando) {
    return (
      <div
        className="pantalla-cargando"
      >
        <Spin
          size="large"
        />
      </div>
    );
  }

  // =====================================
  // TAB: MIS ESTUDIANTES
  // =====================================

  const contenidoMisEstudiantes =
    (
      <>
        <Card>
          <Text strong>
            Clase
          </Text>

          <Select
            size="large"
            showSearch
            optionFilterProp="label"
            placeholder="Seleccione una de sus clases"
            value={
              seccionConsulta
            }
            style={{
              width:
                '100%',

              marginTop:
                8,
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
            onChange={(
              valor,
            ) => {
              const id =
                Number(
                  valor,
                );

              setSeccionConsulta(
                id,
              );

              void cargarEstudiantesClase(
                id,
              );
            }}
          />
        </Card>

        {cargandoEstudiantes && (
          <Card
            style={{
              marginTop:
                20,
            }}
          >
            <div
              style={{
                display:
                  'flex',

                justifyContent:
                  'center',

                padding:
                  30,
              }}
            >
              <Spin />
            </div>
          </Card>
        )}

        {!cargandoEstudiantes &&
          seccionConsulta &&
          estudiantesClase.length ===
            0 && (
            <Alert
              type="info"
              showIcon
              message="Esta clase todavía no tiene estudiantes registrados."
              style={{
                marginTop:
                  20,
              }}
            />
          )}

        {!cargandoEstudiantes &&
          claseConsulta &&
          estudiantesClase.length >
            0 && (
            <Card
              style={{
                marginTop:
                  20,
              }}
            >
              <div
                style={{
                  marginBottom:
                    20,
                }}
              >
                <Space
                  align="center"
                >
                  <TeamOutlined />

                  <Title
                    level={4}
                    style={{
                      margin:
                        0,
                    }}
                  >
                    {
                      obtenerNombreClase(
                        claseConsulta,
                      )
                    }
                  </Title>
                </Space>

                <div
                  style={{
                    marginTop:
                      5,
                  }}
                >
                  <Text
                    type="secondary"
                  >
                    {
                      estudiantesClase.length
                    }{' '}
                    {
                      estudiantesClase.length ===
                      1
                        ? 'estudiante registrado'
                        : 'estudiantes registrados'
                    }
                  </Text>
                </div>
              </div>

              <Table
                rowKey="estudiante_id"
                columns={
                  columnas
                }
                dataSource={
                  estudiantesClase
                }
                pagination={
                  estudiantesClase.length >
                  10
                    ? {
                        pageSize:
                          10,
                      }
                    : false
                }
                scroll={{
                  x:
                    700,
                }}
              />
            </Card>
          )}
      </>
    );

  // =====================================
  // TAB: REGISTRAR
  // =====================================

  const contenidoRegistrar =
    (
      <>
        <Card
          title={
            <Space>
              <UserAddOutlined />

              Registrar nuevo estudiante
            </Space>
          }
        >
          {clases.length ===
          0 ? (
            <Alert
              type="warning"
              showIcon
              message="No tiene clases asignadas."
              description="El administrador debe asignarle una clase antes de registrar estudiantes."
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
              {/* CLASE */}

              <Form.Item
                name="seccion_id"
                label="¿A qué clase pertenece?"
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
                    setSeccionRegistro(
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

              {/* CURSOS */}

              {claseRegistro && (
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
                      {claseRegistro
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

              {/* CARNET */}

              <Form.Item
                name="codigo_estudiante"
                label="Carnet o código del estudiante"
                extra="Ingrese el carnet que utiliza el estudiante en el establecimiento."
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Ingrese el carnet o código del estudiante.',
                  },

                  {
                    whitespace:
                      true,

                    message:
                      'Ingrese un carnet válido.',
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

              {/* NOMBRES */}

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
                          'Ingrese nombres válidos.',
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
                          'Ingrese apellidos válidos.',
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Ejemplo: Pérez López"
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

        {/* ESTUDIANTE RECIEN REGISTRADO */}

        {estudianteCreado &&
          claseRegistrada && (
            <Alert
              type="success"
              showIcon
              message="Estudiante registrado correctamente"
              description={
                <div>
                  <Text>
                    {
                      estudianteCreado.nombres
                    }{' '}
                    {
                      estudianteCreado.apellidos
                    }
                    {' · '}
                    {
                      estudianteCreado.codigo_estudiante
                    }
                  </Text>

                  <div
                    style={{
                      marginTop:
                        12,
                    }}
                  >
                    <Button
                      icon={
                        <QrcodeOutlined />
                      }
                      onClick={() => {
                        void verQr(
                          estudianteCreado,
                          claseRegistrada.id,
                        );
                      }}
                    >
                      Ver QR del estudiante
                    </Button>
                  </div>
                </div>
              }
              style={{
                marginTop:
                  20,
              }}
            />
          )}
      </>
    );

  // =====================================
  // VISTA PRINCIPAL
  // =====================================

  return (
    <div
      className="pagina-administracion"
    >
      <div>
        {/* REGRESAR */}

        <Button
          type="text"
          icon={
            <ArrowLeftOutlined />
          }
          className="boton-regresar"
          onClick={() =>
            navigate(
              '/docente',
            )
          }
        >
          Regresar
        </Button>

        {/* ENCABEZADO */}

        <div
          style={{
            marginBottom:
              22,
          }}
        >
          <Title
            level={2}
            style={{
              marginBottom:
                4,
            }}
          >
            Estudiantes
          </Title>

          <Text
            type="secondary"
          >
            Consulte los estudiantes de
            sus clases o registre un
            estudiante nuevo.
          </Text>
        </div>

        {/* PESTAÑAS */}

        <Card>
          <Tabs
            defaultActiveKey="mis-estudiantes"
            items={[
              {
                key:
                  'mis-estudiantes',

                label: (
                  <Space>
                    <TeamOutlined />

                    Mis estudiantes
                  </Space>
                ),

                children:
                  contenidoMisEstudiantes,
              },

              {
                key:
                  'registrar',

                label: (
                  <Space>
                    <UserAddOutlined />

                    Registrar estudiante
                  </Space>
                ),

                children:
                  contenidoRegistrar,
              },
            ]}
          />
        </Card>

        {/* ================================= */}
        {/* MODAL QR */}
        {/* ================================= */}

        <Modal
          title="Código QR del estudiante"
          open={
            modalQrAbierto
          }
          onCancel={
            cerrarQr
          }
          footer={[
            <Button
              key="cerrar"
              onClick={
                cerrarQr
              }
            >
              Cerrar
            </Button>,
          ]}
          width={
            460
          }
        >
          {cargandoQr ? (
            <div
              style={{
                display:
                  'flex',

                justifyContent:
                  'center',

                padding:
                  50,
              }}
            >
              <Spin />
            </div>
          ) : (
            <div
              style={{
                textAlign:
                  'center',

                padding:
                  '10px 0',
              }}
            >
              {estudianteQr && (
                <>
                  <Title
                    level={4}
                    style={{
                      marginBottom:
                        4,
                    }}
                  >
                    {
                      estudianteQr.nombres
                    }{' '}
                    {
                      estudianteQr.apellidos
                    }
                  </Title>

                  <Text
                    type="secondary"
                  >
                    {
                      estudianteQr.codigo_estudiante
                    }
                  </Text>
                </>
              )}

              {qrUrl && (
                <div
                  style={{
                    marginTop:
                      20,
                  }}
                >
                  <Image
                    src={
                      qrUrl
                    }
                    width={
                      280
                    }
                    preview
                  />
                </div>
              )}

              <Alert
                type="info"
                showIcon
                message="QR de asistencia"
                description="Este código identifica al estudiante durante el registro de asistencia."
                style={{
                  marginTop:
                    20,

                  textAlign:
                    'left',
                }}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}