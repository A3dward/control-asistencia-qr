import {
  ArrowLeftOutlined,
  EditOutlined,
  IdcardOutlined,
  PlusOutlined,
  PoweroffOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
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

interface Estudiante {
  id: number;

  codigo_estudiante: string;

  nombres: string;

  apellidos: string;

  token_qr: string;

  activo: boolean;

  fecha_creacion?: string;

  fecha_actualizacion?: string | null;
}

interface Seccion {
  id: number;

  nombre: string;

  grado: string;

  anio_academico: number;

  activo: boolean;
}

interface Inscripcion {
  id: number;

  estudiante_id: number;

  seccion_id: number;

  fecha_inscripcion: string;

  activo: boolean;

  codigo_estudiante: string;

  nombres: string;

  apellidos: string;

  seccion: string;

  grado: string;

  anio_academico: number;
}

interface FormularioEstudiante {
  seccion_id?: number;

  codigo_estudiante: string;

  nombres: string;

  apellidos: string;
}

// =====================================
// COMPONENTE
// =====================================

export default function Estudiantes() {
  const navigate =
    useNavigate();

  const [
    form,
  ] =
    Form.useForm<FormularioEstudiante>();

  const [
    estudiantes,
    setEstudiantes,
  ] =
    useState<Estudiante[]>([]);

  const [
    secciones,
    setSecciones,
  ] =
    useState<Seccion[]>([]);

  const [
    inscripciones,
    setInscripciones,
  ] =
    useState<Inscripcion[]>([]);

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
    modalAbierto,
    setModalAbierto,
  ] =
    useState(false);

  const [
    estudianteEditando,
    setEstudianteEditando,
  ] =
    useState<Estudiante | null>(
      null,
    );

  const [
    modalQrAbierto,
    setModalQrAbierto,
  ] =
    useState(false);

  const [
    qrUrl,
    setQrUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    estudianteQr,
    setEstudianteQr,
  ] =
    useState<Estudiante | null>(
      null,
    );

  const [
    cargandoQr,
    setCargandoQr,
  ] =
    useState(false);

  // =====================================
  // MENSAJE DE ERROR
  // =====================================

  const obtenerMensajeError = (
    error: unknown,
    predeterminado: string,
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

    return predeterminado;
  };

  // =====================================
  // NOMBRE DE CLASE
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
  // OBTENER ESTUDIANTES
  // =====================================

  const obtenerEstudiantes =
    async () => {
      const respuesta =
        await api.get(
          '/estudiantes',
        );

      const datos =
        respuesta.data
          .datos ?? [];

      const normalizados:
        Estudiante[] =
        datos.map(
          (
            estudiante: any,
          ) => ({
            ...estudiante,

            id:
              Number(
                estudiante.id,
              ),

            activo:
              Boolean(
                estudiante.activo,
              ),
          }),
        );

      setEstudiantes(
        normalizados,
      );
    };

  // =====================================
  // OBTENER TODAS LAS CLASES
  // ADMIN
  // =====================================

  const obtenerSecciones =
    async () => {
      const respuesta =
        await api.get(
          '/secciones',
        );

      const datos =
        respuesta.data
          .datos ?? [];

      const normalizadas:
        Seccion[] =
        datos.map(
          (
            seccion: any,
          ) => ({
            ...seccion,

            id:
              Number(
                seccion.id,
              ),

            anio_academico:
              Number(
                seccion.anio_academico,
              ),

            activo:
              Boolean(
                seccion.activo,
              ),
          }),
        );

      setSecciones(
        normalizadas,
      );
    };

  // =====================================
  // OBTENER INSCRIPCIONES
  // PARA MOSTRAR LA CLASE ACTUAL
  // =====================================

  const obtenerInscripciones =
    async () => {
      const respuesta =
        await api.get(
          '/inscripciones',
        );

      const datos =
        respuesta.data
          .datos ?? [];

      const normalizadas:
        Inscripcion[] =
        datos.map(
          (
            inscripcion: any,
          ) => ({
            ...inscripcion,

            id:
              Number(
                inscripcion.id,
              ),

            estudiante_id:
              Number(
                inscripcion.estudiante_id,
              ),

            seccion_id:
              Number(
                inscripcion.seccion_id,
              ),

            anio_academico:
              Number(
                inscripcion.anio_academico,
              ),

            activo:
              Boolean(
                inscripcion.activo,
              ),
          }),
        );

      setInscripciones(
        normalizadas,
      );
    };

  // =====================================
  // CARGAR DATOS
  // =====================================

  const cargarDatos =
    async () => {
      try {
        setCargando(
          true,
        );

        await Promise.all([
          obtenerEstudiantes(),
          obtenerSecciones(),
          obtenerInscripciones(),
        ]);
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar la informacion de estudiantes.',
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
      cargarDatos();
    },
    [],
  );

  // =====================================
  // INSCRIPCION ACTIVA POR ESTUDIANTE
  // =====================================

  const inscripcionPorEstudiante =
    useMemo(
      () => {
        const mapa =
          new Map<
            number,
            Inscripcion
          >();

        inscripciones
          .filter(
            (
              inscripcion,
            ) =>
              Boolean(
                inscripcion.activo,
              ),
          )
          .forEach(
            (
              inscripcion,
            ) => {
              mapa.set(
                Number(
                  inscripcion.estudiante_id,
                ),
                inscripcion,
              );
            },
          );

        return mapa;
      },
      [
        inscripciones,
      ],
    );

  // =====================================
  // TODAS LAS CLASES ACTIVAS PARA ADMIN
  // =====================================

  const opcionesClases =
    useMemo(
      () =>
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
                obtenerNombreClase({
                  grado:
                    seccion.grado,

                  seccion:
                    seccion.nombre,

                  anio_academico:
                    seccion.anio_academico,
                }),
            }),
          ),
      [
        secciones,
      ],
    );

  // =====================================
  // NUEVO
  // =====================================

  const abrirNuevo = () => {
    setEstudianteEditando(
      null,
    );

    form.resetFields();

    setModalAbierto(
      true,
    );
  };

  // =====================================
  // EDITAR
  // =====================================

  const abrirEditar = (
    estudiante:
      Estudiante,
  ) => {
    setEstudianteEditando(
      estudiante,
    );

    const inscripcion =
      inscripcionPorEstudiante.get(
        estudiante.id,
      );

    form.setFieldsValue({
      codigo_estudiante:
        estudiante.codigo_estudiante,

      nombres:
        estudiante.nombres,

      apellidos:
        estudiante.apellidos,

      seccion_id:
        inscripcion
          ?.seccion_id,
    });

    setModalAbierto(
      true,
    );
  };

  // =====================================
  // CERRAR MODAL
  // =====================================

  const cerrarModal = () => {
    setModalAbierto(
      false,
    );

    setEstudianteEditando(
      null,
    );

    form.resetFields();
  };

  // =====================================
  // GUARDAR
  // =====================================

  const guardarEstudiante =
    async (
      valores:
        FormularioEstudiante,
    ) => {
      try {
        setGuardando(
          true,
        );

        // =================================
        // EDITAR ESTUDIANTE
        // =================================

        if (
          estudianteEditando
        ) {
          await api.patch(
            `/estudiantes/${estudianteEditando.id}`,
            {
              codigo_estudiante:
                valores.codigo_estudiante
                  .trim()
                  .toUpperCase(),

              nombres:
                valores.nombres
                  .trim(),

              apellidos:
                valores.apellidos
                  .trim(),
            },
          );

          message.success(
            'Estudiante actualizado correctamente.',
          );

          cerrarModal();

          await cargarDatos();

          return;
        }

        // =================================
        // NUEVO ESTUDIANTE
        // =================================

        if (
          !valores.seccion_id
        ) {
          message.error(
            'Seleccione la clase del estudiante.',
          );

          return;
        }

        // =================================
        // PASO 1:
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
                valores.nombres
                  .trim(),

              apellidos:
                valores.apellidos
                  .trim(),
            },
          );

        const estudianteCreado =
          respuestaEstudiante
            .data
            .datos;

        // =================================
        // PASO 2:
        // INSCRIBIR AUTOMATICAMENTE
        // EN LA CLASE SELECCIONADA
        // =================================

        try {
          await api.post(
            '/inscripciones',
            {
              estudiante_id:
                Number(
                  estudianteCreado.id,
                ),

              seccion_id:
                Number(
                  valores.seccion_id,
                ),
            },
          );
        } catch (
          errorInscripcion
        ) {
          message.error(
            obtenerMensajeError(
              errorInscripcion,
              'El estudiante fue creado, pero no fue posible asignarlo a la clase.',
            ),
          );

          await cargarDatos();

          return;
        }

        message.success(
          'Estudiante registrado y asignado a su clase correctamente.',
        );

        cerrarModal();

        await cargarDatos();
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible guardar el estudiante.',
          ),
        );
      } finally {
        setGuardando(
          false,
        );
      }
    };

  // =====================================
  // ACTIVAR / DESACTIVAR ESTUDIANTE
  // =====================================

  const cambiarEstado =
    async (
      estudiante:
        Estudiante,
    ) => {
      try {
        const ruta =
          estudiante.activo
            ? `/estudiantes/${estudiante.id}/desactivar`
            : `/estudiantes/${estudiante.id}/activar`;

        await api.patch(
          ruta,
        );

        message.success(
          estudiante.activo
            ? 'Estudiante desactivado correctamente.'
            : 'Estudiante activado correctamente.',
        );

        await cargarDatos();
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cambiar el estado del estudiante.',
          ),
        );
      }
    };

  // =====================================
  // QR
  // =====================================

  const abrirQr =
    async (
      estudiante:
        Estudiante,
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

        if (qrUrl) {
          URL.revokeObjectURL(
            qrUrl,
          );

          setQrUrl(
            null,
          );
        }

        const respuesta =
          await api.get(
            `/estudiantes/${estudiante.id}/qr`,
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
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible obtener el codigo QR.',
          ),
        );

        setModalQrAbierto(
          false,
        );
      } finally {
        setCargandoQr(
          false,
        );
      }
    };

  const cerrarQr = () => {
    if (qrUrl) {
      URL.revokeObjectURL(
        qrUrl,
      );
    }

    setQrUrl(
      null,
    );

    setEstudianteQr(
      null,
    );

    setModalQrAbierto(
      false,
    );
  };

  // =====================================
  // COLUMNAS
  // =====================================

  const columnas:
    TableColumnsType<Estudiante> =
    [
      {
        title:
          'Carnet',

        dataIndex:
          'codigo_estudiante',

        key:
          'codigo_estudiante',

        width:
          150,
      },

      {
        title:
          'Estudiante',

        key:
          'estudiante',

        render: (
          _,
          estudiante,
        ) =>
          `${estudiante.nombres} ${estudiante.apellidos}`,
      },

      {
        title:
          'Clase',

        key:
          'clase',

        render: (
          _,
          estudiante,
        ) => {
          const inscripcion =
            inscripcionPorEstudiante.get(
              estudiante.id,
            );

          if (
            !inscripcion
          ) {
            return (
              <Tag
                color="orange"
              >
                SIN CLASE
              </Tag>
            );
          }

          return obtenerNombreClase({
            grado:
              inscripcion.grado,

            seccion:
              inscripcion.seccion,

            anio_academico:
              inscripcion.anio_academico,
          });
        },
      },

      {
        title:
          'Estado',

        dataIndex:
          'activo',

        key:
          'activo',

        width:
          120,

        render: (
          activo:
            boolean,
        ) => (
          <Tag
            color={
              activo
                ? 'green'
                : 'red'
            }
          >
            {activo
              ? 'ACTIVO'
              : 'INACTIVO'}
          </Tag>
        ),
      },

      {
        title:
          'Acciones',

        key:
          'acciones',

        width:
          310,

        render: (
          _,
          estudiante,
        ) => (
          <Space
            wrap
          >
            <Button
              icon={
                <EditOutlined />
              }
              onClick={() =>
                abrirEditar(
                  estudiante,
                )
              }
            >
              Editar
            </Button>

            <Button
              icon={
                <QrcodeOutlined />
              }
              disabled={
                !estudiante.activo
              }
              onClick={() =>
                abrirQr(
                  estudiante,
                )
              }
            >
              QR
            </Button>

            <Popconfirm
              title={
                estudiante.activo
                  ? 'Desactivar estudiante'
                  : 'Activar estudiante'
              }
              description={
                estudiante.activo
                  ? '¿Desea desactivar este estudiante?'
                  : '¿Desea activar este estudiante?'
              }
              okText="Si"
              cancelText="No"
              onConfirm={() =>
                cambiarEstado(
                  estudiante,
                )
              }
            >
              <Button
                danger={
                  estudiante.activo
                }
                type={
                  estudiante.activo
                    ? 'default'
                    : 'primary'
                }
                icon={
                  <PoweroffOutlined />
                }
              >
                {estudiante.activo
                  ? 'Desactivar'
                  : 'Activar'}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

  // =====================================
  // VISTA
  // =====================================

  return (
    <div
      className="pagina-administracion"
    >
      {/* ================================= */}
      {/* ENCABEZADO */}
      {/* ================================= */}

      <div
        className="pagina-encabezado"
      >
        <div>
          <Button
            type="text"
            icon={
              <ArrowLeftOutlined />
            }
            onClick={() =>
              navigate(
                '/admin',
              )
            }
            className="boton-regresar"
          >
            Regresar
          </Button>

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
            Registre un estudiante
            y seleccione directamente
            la clase a la que pertenece.
          </Text>
        </div>

        <Button
          type="primary"
          icon={
            <PlusOutlined />
          }
          size="large"
          onClick={
            abrirNuevo
          }
        >
          Nuevo estudiante
        </Button>
      </div>

      {/* ================================= */}
      {/* INFORMACION */}
      {/* ================================= */}

      <Alert
        type="info"
        showIcon
        message="Registro de estudiante"
        description="El administrador puede registrar al estudiante en cualquiera de las clases activas del establecimiento."
        style={{
          marginBottom:
            20,
        }}
      />

      {/* ================================= */}
      {/* TABLA */}
      {/* ================================= */}

      <Card>
        <Table
          rowKey="id"
          columns={
            columnas
          }
          dataSource={
            estudiantes
          }
          loading={
            cargando
          }
          scroll={{
            x:
              1000,
          }}
          pagination={{
            pageSize:
              10,

            showSizeChanger:
              true,

            showTotal: (
              total,
            ) =>
              `Total: ${total} estudiantes`,
          }}
        />
      </Card>

      {/* ================================= */}
      {/* MODAL NUEVO / EDITAR */}
      {/* ================================= */}

      <Modal
        title={
          estudianteEditando
            ? 'Editar estudiante'
            : 'Registrar nuevo estudiante'
        }
        open={
          modalAbierto
        }
        onCancel={
          cerrarModal
        }
        footer={
          null
        }
        destroyOnHidden
      >
        <Form
          form={
            form
          }
          layout="vertical"
          onFinish={
            guardarEstudiante
          }
        >
          {/* ================================= */}
          {/* CLASE PRIMERO */}
          {/* ================================= */}

          <Form.Item
            label="¿A que clase pertenece?"
            name="seccion_id"
            extra={
              estudianteEditando
                ? 'La clase se muestra como referencia y no se modifica desde esta opcion.'
                : 'Como administrador puede seleccionar cualquier clase activa.'
            }
            rules={
              estudianteEditando
                ? []
                : [
                    {
                      required:
                        true,

                      message:
                        'Seleccione la clase del estudiante.',
                    },
                  ]
            }
          >
            <Select
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder="Seleccione la clase"
              options={
                opcionesClases
              }
              disabled={
                Boolean(
                  estudianteEditando,
                )
              }
              notFoundContent="No hay clases activas"
            />
          </Form.Item>

          {/* ================================= */}
          {/* CARNET */}
          {/* ================================= */}

          <Form.Item
            label="Carnet o codigo del estudiante"
            name="codigo_estudiante"
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
                  'Maximo 30 caracteres.',
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

          {/* ================================= */}
          {/* NOMBRES */}
          {/* ================================= */}

          <Form.Item
            label="Nombres"
            name="nombres"
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

              {
                max:
                  100,

                message:
                  'Maximo 100 caracteres.',
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

          {/* ================================= */}
          {/* APELLIDOS */}
          {/* ================================= */}

          <Form.Item
            label="Apellidos"
            name="apellidos"
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

              {
                max:
                  100,

                message:
                  'Maximo 100 caracteres.',
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

          {/* ================================= */}
          {/* BOTONES */}
          {/* ================================= */}

          <Space
            style={{
              width:
                '100%',

              justifyContent:
                'flex-end',
            }}
          >
            <Button
              onClick={
                cerrarModal
              }
            >
              Cancelar
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={
                guardando
              }
            >
              {estudianteEditando
                ? 'Guardar cambios'
                : 'Registrar estudiante'}
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* ================================= */}
      {/* QR */}
      {/* ================================= */}

      <Modal
        title="Codigo QR del estudiante"
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
        destroyOnHidden
      >
        <div
          style={{
            textAlign:
              'center',

            padding:
              20,
          }}
        >
          {cargandoQr ? (
            <Text>
              Generando codigo QR...
            </Text>
          ) : (
            <>
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
                    Carnet:{' '}
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
                  <img
                    src={
                      qrUrl
                    }
                    alt="Codigo QR del estudiante"
                    style={{
                      maxWidth:
                        300,

                      width:
                        '100%',
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}