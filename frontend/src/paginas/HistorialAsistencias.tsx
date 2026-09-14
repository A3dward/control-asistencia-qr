import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Col,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
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

  codigo_curso:
    string;

  curso:
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

interface Resumen {
  total_registros:
    number;

  presentes:
    number;

  ausentes:
    number;

  tarde:
    number;

  justificados:
    number;
}

interface SesionHistorial {
  id:
    number;

  asignacion_docente_id:
    number;

  fecha_sesion:
    string;

  hora_inicio:
    string;

  hora_fin:
    string | null;

  estado:
    string;

  asignacion_id:
    number;

  curso_id:
    number;

  codigo_curso:
    string;

  curso:
    string;

  seccion_id:
    number;

  seccion:
    string;

  grado:
    string;

  anio_academico:
    number;

  resumen:
    Resumen;
}

interface AsistenciaDetalle {
  asistencia_id:
    number;

  sesion_clase_id:
    number;

  estudiante_id:
    number;

  fecha_hora_asistencia:
    string | null;

  estado:
    string;

  codigo_estudiante:
    string;

  nombres:
    string;

  apellidos:
    string;
}

// =====================================
// COMPONENTE
// =====================================

export default function HistorialAsistencias() {
  const navigate =
    useNavigate();

  // =====================================
  // DATOS
  // =====================================

  const [
    asignaciones,
    setAsignaciones,
  ] =
    useState<
      Asignacion[]
    >([]);

  const [
    sesiones,
    setSesiones,
  ] =
    useState<
      SesionHistorial[]
    >([]);

  const [
    detalle,
    setDetalle,
  ] =
    useState<
      AsistenciaDetalle[]
    >([]);

  const [
    sesionSeleccionada,
    setSesionSeleccionada,
  ] =
    useState<
      SesionHistorial | null
    >(null);

  // =====================================
  // FILTROS
  // =====================================

  const [
    filtroSeccionId,
    setFiltroSeccionId,
  ] =
    useState<
      number | undefined
    >(undefined);

  const [
    filtroAsignacionId,
    setFiltroAsignacionId,
  ] =
    useState<
      number | undefined
    >(undefined);

  const [
    filtroEstado,
    setFiltroEstado,
  ] =
    useState<
      string | undefined
    >(undefined);

  // =====================================
  // ESTADOS
  // =====================================

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    cargandoDetalle,
    setCargandoDetalle,
  ] =
    useState(false);

  const [
    modalAbierto,
    setModalAbierto,
  ] =
    useState(false);

  // =====================================
  // ERROR API
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

    return predeterminado;
  };

  // =====================================
  // NOMBRE CLASE
  // =====================================

  const obtenerNombreClase = (
    datos: {
      grado:
        string;

      seccion:
        string;

      anio_academico:
        number;
    },
  ) => {
    const mostrarSeccion =
      datos.seccion &&
      datos.seccion
        .toLowerCase() !==
        'general';

    return mostrarSeccion
      ? `${datos.grado} - Seccion ${datos.seccion} - ${datos.anio_academico}`
      : `${datos.grado} - ${datos.anio_academico}`;
  };

  // =====================================
  // FECHA
  // =====================================

  const formatearFecha = (
    valor:
      string,
  ) => {
    if (
      !valor
    ) {
      return '-';
    }

    const fecha =
      String(
        valor,
      ).substring(
        0,
        10,
      );

    const partes =
      fecha.split(
        '-',
      );

    if (
      partes.length !==
      3
    ) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // =====================================
  // HORA
  // =====================================

  const formatearHora = (
    valor:
      string | null,
  ) => {
    if (
      !valor
    ) {
      return '-';
    }

    // =================================
    // SI VIENE COMO HH:MM:SS
    // =================================

    if (
      /^\d{2}:\d{2}/.test(
        valor,
      )
    ) {
      return valor.substring(
        0,
        8,
      );
    }

    const fecha =
      new Date(
        valor,
      );

    if (
      Number.isNaN(
        fecha.getTime(),
      )
    ) {
      return valor;
    }

    return fecha.toLocaleTimeString(
      'es-GT',
      {
        hour:
          '2-digit',

        minute:
          '2-digit',

        second:
          '2-digit',

        hour12:
          true,

        timeZone:
          'America/Guatemala',
      },
    );
  };

  // =====================================
  // CLASES UNICAS
  // =====================================

  const clases =
    useMemo(
      () => {
        const mapa =
          new Map<
            number,
            Asignacion
          >();

        asignaciones.forEach(
          (
            asignacion,
          ) => {
            mapa.set(
              Number(
                asignacion.seccion_id,
              ),
              asignacion,
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
  // CURSOS PARA FILTRO
  // =====================================

  const cursosFiltro =
    useMemo(
      () =>
        asignaciones.filter(
          (
            asignacion,
          ) =>
            !filtroSeccionId ||
            Number(
              asignacion.seccion_id,
            ) ===
              Number(
                filtroSeccionId,
              ),
        ),
      [
        asignaciones,
        filtroSeccionId,
      ],
    );

  // =====================================
  // SESIONES FILTRADAS
  // =====================================

  const sesionesFiltradas =
    useMemo(
      () =>
        sesiones.filter(
          (
            sesion,
          ) => {
            const cumpleClase =
              !filtroSeccionId ||
              Number(
                sesion.seccion_id,
              ) ===
                Number(
                  filtroSeccionId,
                );

            const cumpleCurso =
              !filtroAsignacionId ||
              Number(
                sesion.asignacion_id,
              ) ===
                Number(
                  filtroAsignacionId,
                );

            const cumpleEstado =
              !filtroEstado ||
              sesion.estado ===
                filtroEstado;

            return (
              cumpleClase &&
              cumpleCurso &&
              cumpleEstado
            );
          },
        ),
      [
        sesiones,
        filtroSeccionId,
        filtroAsignacionId,
        filtroEstado,
      ],
    );

  // =====================================
  // TOTALES GENERALES
  // =====================================

  const totalPresentes =
    sesionesFiltradas.reduce(
      (
        acumulado,
        sesion,
      ) =>
        acumulado +
        Number(
          sesion.resumen.presentes,
        ),
      0,
    );

  const totalAusentes =
    sesionesFiltradas.reduce(
      (
        acumulado,
        sesion,
      ) =>
        acumulado +
        Number(
          sesion.resumen.ausentes,
        ),
      0,
    );

  const totalRegistros =
    sesionesFiltradas.reduce(
      (
        acumulado,
        sesion,
      ) =>
        acumulado +
        Number(
          sesion.resumen.total_registros,
        ),
      0,
    );

  // =====================================
  // CARGAR HISTORIAL
  // =====================================

  const cargarHistorial =
    async () => {
      try {
        setCargando(
          true,
        );

        // =================================
        // ASIGNACIONES DEL DOCENTE
        // =================================

        const respuestaAsignaciones =
          await api.get(
            '/asignaciones/mis-asignaciones',
          );

        const datosAsignaciones =
          respuestaAsignaciones
            .data
            .datos ?? [];

        const normalizadas:
          Asignacion[] =
          datosAsignaciones.map(
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
          normalizadas,
        );

        // =================================
        // SESIONES DE CADA CURSO
        // =================================

        const resultados =
          await Promise.all(
            normalizadas.map(
              async (
                asignacion,
              ) => {
                const respuesta =
                  await api.get(
                    `/sesiones-clase/asignacion/${asignacion.asignacion_id}`,
                  );

                const datos =
                  respuesta.data
                    .datos ?? [];

                return datos.map(
                  (
                    sesion:
                      any,
                  ) => ({
                    ...sesion,

                    id:
                      Number(
                        sesion.id,
                      ),

                    asignacion_docente_id:
                      Number(
                        sesion.asignacion_docente_id,
                      ),

                    asignacion_id:
                      asignacion.asignacion_id,

                    curso_id:
                      asignacion.curso_id,

                    codigo_curso:
                      asignacion.codigo_curso,

                    curso:
                      asignacion.curso,

                    seccion_id:
                      asignacion.seccion_id,

                    seccion:
                      asignacion.seccion,

                    grado:
                      asignacion.grado,

                    anio_academico:
                      asignacion.anio_academico,

                    resumen: {
                      total_registros:
                        0,

                      presentes:
                        0,

                      ausentes:
                        0,

                      tarde:
                        0,

                      justificados:
                        0,
                    },
                  }),
                );
              },
            ),
          );

        const todasSesiones:
          SesionHistorial[] =
          resultados.flat();

        // =================================
        // RESUMEN DE CADA SESION
        // =================================

        const sesionesConResumen =
          await Promise.all(
            todasSesiones.map(
              async (
                sesion,
              ) => {
                try {
                  const respuesta =
                    await api.get(
                      `/asistencias/sesion/${sesion.id}/resumen`,
                    );

                  const resumen =
                    respuesta.data
                      .datos
                      ?.resumen;

                  return {
                    ...sesion,

                    resumen: {
                      total_registros:
                        Number(
                          resumen?.total_registros ??
                            0,
                        ),

                      presentes:
                        Number(
                          resumen?.presentes ??
                            0,
                        ),

                      ausentes:
                        Number(
                          resumen?.ausentes ??
                            0,
                        ),

                      tarde:
                        Number(
                          resumen?.tarde ??
                            0,
                        ),

                      justificados:
                        Number(
                          resumen?.justificados ??
                            0,
                        ),
                    },
                  };
                } catch {
                  return sesion;
                }
              },
            ),
          );

        // =================================
        // MAS RECIENTES PRIMERO
        // =================================

        sesionesConResumen.sort(
          (
            a,
            b,
          ) => {
            const fechaA =
              new Date(
                a.hora_inicio,
              ).getTime();

            const fechaB =
              new Date(
                b.hora_inicio,
              ).getTime();

            if (
              !Number.isNaN(
                fechaA,
              ) &&
              !Number.isNaN(
                fechaB,
              )
            ) {
              return (
                fechaB -
                fechaA
              );
            }

            return (
              Number(
                b.id,
              ) -
              Number(
                a.id,
              )
            );
          },
        );

        setSesiones(
          sesionesConResumen,
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar el historial de asistencias.',
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
      void cargarHistorial();
    },
    [],
  );

  // =====================================
  // VER DETALLE
  // =====================================

  const abrirDetalle =
    async (
      sesion:
        SesionHistorial,
    ) => {
      try {
        setSesionSeleccionada(
          sesion,
        );

        setModalAbierto(
          true,
        );

        setCargandoDetalle(
          true,
        );

        setDetalle(
          [],
        );

        const respuesta =
          await api.get(
            `/asistencias/sesion/${sesion.id}`,
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const normalizados:
          AsistenciaDetalle[] =
          datos.map(
            (
              asistencia:
                any,
            ) => ({
              ...asistencia,

              asistencia_id:
                Number(
                  asistencia.asistencia_id,
                ),

              sesion_clase_id:
                Number(
                  asistencia.sesion_clase_id,
                ),

              estudiante_id:
                Number(
                  asistencia.estudiante_id,
                ),
            }),
          );

        setDetalle(
          normalizados,
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible obtener el detalle de la asistencia.',
          ),
        );
      } finally {
        setCargandoDetalle(
          false,
        );
      }
    };

  // =====================================
  // ESTADO
  // =====================================

  const etiquetaEstado = (
    estado:
      string,
  ) => {
    if (
      estado ===
      'CERRADA'
    ) {
      return (
        <Tag
          color="green"
        >
          CERRADA
        </Tag>
      );
    }

    if (
      estado ===
      'ABIERTA'
    ) {
      return (
        <Tag
          color="blue"
        >
          ABIERTA
        </Tag>
      );
    }

    if (
      estado ===
      'CANCELADA'
    ) {
      return (
        <Tag
          color="red"
        >
          CANCELADA
        </Tag>
      );
    }

    return (
      <Tag>
        {estado}
      </Tag>
    );
  };

  // =====================================
  // PORCENTAJE
  // =====================================

  const porcentajeSesion = (
    sesion:
      SesionHistorial,
  ) => {
    const total =
      Number(
        sesion.resumen
          .total_registros,
      );

    if (
      total ===
      0
    ) {
      return 0;
    }

    return (
      Number(
        sesion.resumen
          .presentes,
      ) /
      total
    ) *
      100;
  };

  // =====================================
  // COLUMNAS HISTORIAL
  // =====================================

  const columnas:
    TableColumnsType<SesionHistorial> =
    [
      {
        title:
          'Sesion',

        dataIndex:
          'id',

        key:
          'id',

        width:
          90,

        render: (
          id:
            number,
        ) =>
          `#${id}`,
      },

      {
        title:
          'Fecha',

        dataIndex:
          'fecha_sesion',

        key:
          'fecha_sesion',

        width:
          120,

        render: (
          fecha:
            string,
        ) =>
          formatearFecha(
            fecha,
          ),
      },

      {
        title:
          'Horario',

        key:
          'horario',

        width:
          190,

        render: (
          _,
          sesion,
        ) =>
          `${formatearHora(
            sesion.hora_inicio,
          )} - ${formatearHora(
            sesion.hora_fin,
          )}`,
      },

      {
        title:
          'Clase',

        key:
          'clase',

        render: (
          _,
          sesion,
        ) =>
          obtenerNombreClase(
            sesion,
          ),
      },

      {
        title:
          'Curso',

        key:
          'curso',

        render: (
          _,
          sesion,
        ) =>
          `${sesion.codigo_curso} - ${sesion.curso}`,
      },

      {
        title:
          'Estado',

        dataIndex:
          'estado',

        key:
          'estado',

        width:
          120,

        render: (
          estado:
            string,
        ) =>
          etiquetaEstado(
            estado,
          ),
      },

      {
        title:
          'Presentes',

        key:
          'presentes',

        width:
          110,

        align:
          'center',

        render: (
          _,
          sesion,
        ) =>
          sesion.resumen
            .presentes,
      },

      {
        title:
          'Ausentes',

        key:
          'ausentes',

        width:
          110,

        align:
          'center',

        render: (
          _,
          sesion,
        ) =>
          sesion.resumen
            .ausentes,
      },

      {
        title:
          'Asistencia',

        key:
          'porcentaje',

        width:
          120,

        align:
          'center',

        render: (
          _,
          sesion,
        ) =>
          `${porcentajeSesion(
            sesion,
          ).toFixed(
            1,
          )}%`,
      },

      {
        title:
          'Accion',

        key:
          'accion',

        width:
          120,

        fixed:
          'right',

        render: (
          _,
          sesion,
        ) => (
          <Button
            type="primary"
            icon={
              <EyeOutlined />
            }
            onClick={() => {
              void abrirDetalle(
                sesion,
              );
            }}
          >
            Ver
          </Button>
        ),
      },
    ];

  // =====================================
  // COLUMNAS DETALLE
  // =====================================

  const columnasDetalle:
    TableColumnsType<AsistenciaDetalle> =
    [
      {
        title:
          'Carnet',

        dataIndex:
          'codigo_estudiante',

        key:
          'codigo_estudiante',

        width:
          130,
      },

      {
        title:
          'Estudiante',

        key:
          'estudiante',

        render: (
          _,
          asistencia,
        ) =>
          `${asistencia.nombres} ${asistencia.apellidos}`,
      },

      {
        title:
          'Estado',

        dataIndex:
          'estado',

        key:
          'estado',

        width:
          130,

        render: (
          estado:
            string,
        ) => (
          <Tag
            color={
              estado ===
              'PRESENTE'
                ? 'green'
                : 'red'
            }
          >
            {estado}
          </Tag>
        ),
      },

      {
        title:
          'Hora registrada',

        key:
          'hora',

        width:
          180,

        render: (
          _,
          asistencia,
        ) =>
          asistencia.estado ===
          'PRESENTE'
            ? formatearHora(
                asistencia.fecha_hora_asistencia,
              )
            : '-',
      },
    ];

  // =====================================
  // VISTA
  // =====================================

  return (
    <div
      style={{
        maxWidth:
          1400,

        margin:
          '0 auto',

        padding:
          24,
      }}
    >
      {/* ================================= */}
      {/* ENCABEZADO */}
      {/* ================================= */}

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
          onClick={() => {
            void cargarHistorial();
          }}
        >
          Actualizar
        </Button>
      </Space>

      <Title
        level={2}
        style={{
          marginBottom:
            4,
        }}
      >
        Historial de asistencias
      </Title>

      <Text
        type="secondary"
      >
        Consulte las sesiones de
        asistencia realizadas en
        sus clases y cursos.
      </Text>

      {/* ================================= */}
      {/* RESUMEN GENERAL */}
      {/* ================================= */}

      <Row
        gutter={[
          16,
          16,
        ]}
        style={{
          marginTop:
            24,

          marginBottom:
            24,
        }}
      >
        <Col
          xs={12}
          md={6}
        >
          <Card>
            <Statistic
              title="Sesiones"
              value={
                sesionesFiltradas.length
              }
              prefix={
                <HistoryOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={12}
          md={6}
        >
          <Card>
            <Statistic
              title="Registros"
              value={
                totalRegistros
              }
            />
          </Card>
        </Col>

        <Col
          xs={12}
          md={6}
        >
          <Card>
            <Statistic
              title="Presentes"
              value={
                totalPresentes
              }
              prefix={
                <CheckCircleOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={12}
          md={6}
        >
          <Card>
            <Statistic
              title="Ausentes"
              value={
                totalAusentes
              }
              prefix={
                <CloseCircleOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ================================= */}
      {/* FILTROS */}
      {/* ================================= */}

      <Card
        title="Filtros"
        style={{
          marginBottom:
            24,
        }}
      >
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
            <Text strong>
              Clase
            </Text>

            <Select
              allowClear
              style={{
                width:
                  '100%',

                marginTop:
                  8,
              }}
              placeholder="Todas las clases"
              value={
                filtroSeccionId
              }
              options={
                clases.map(
                  (
                    clase,
                  ) => ({
                    value:
                      clase.seccion_id,

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
                setFiltroSeccionId(
                  valor,
                );

                setFiltroAsignacionId(
                  undefined,
                );
              }}
            />
          </Col>

          <Col
            xs={24}
            md={8}
          >
            <Text strong>
              Curso
            </Text>

            <Select
              allowClear
              style={{
                width:
                  '100%',

                marginTop:
                  8,
              }}
              placeholder="Todos los cursos"
              value={
                filtroAsignacionId
              }
              options={
                cursosFiltro.map(
                  (
                    asignacion,
                  ) => ({
                    value:
                      asignacion.asignacion_id,

                    label:
                      `${asignacion.codigo_curso} - ${asignacion.curso}`,
                  }),
                )
              }
              onChange={
                setFiltroAsignacionId
              }
            />
          </Col>

          <Col
            xs={24}
            md={8}
          >
            <Text strong>
              Estado
            </Text>

            <Select
              allowClear
              style={{
                width:
                  '100%',

                marginTop:
                  8,
              }}
              placeholder="Todos los estados"
              value={
                filtroEstado
              }
              options={[
                {
                  value:
                    'CERRADA',

                  label:
                    'Cerrada',
                },

                {
                  value:
                    'ABIERTA',

                  label:
                    'Abierta',
                },

                {
                  value:
                    'CANCELADA',

                  label:
                    'Cancelada',
                },
              ]}
              onChange={
                setFiltroEstado
              }
            />
          </Col>
        </Row>
      </Card>

      {/* ================================= */}
      {/* HISTORIAL */}
      {/* ================================= */}

      <Card
        title={
          <Space>
            <HistoryOutlined />

            Sesiones realizadas
          </Space>
        }
      >
        {cargando ? (
          <div
            style={{
              textAlign:
                'center',

              padding:
                50,
            }}
          >
            <Spin
              size="large"
            />
          </div>
        ) : sesionesFiltradas.length ===
          0 ? (
          <Alert
            type="info"
            showIcon
            message="No se encontraron sesiones de asistencia."
          />
        ) : (
          <Table
            rowKey="id"
            columns={
              columnas
            }
            dataSource={
              sesionesFiltradas
            }
            pagination={{
              pageSize:
                10,

              showSizeChanger:
                true,

              showTotal: (
                total,
              ) =>
                `Total: ${total} sesiones`,
            }}
            scroll={{
              x:
                1400,
            }}
          />
        )}
      </Card>

      {/* ================================= */}
      {/* DETALLE */}
      {/* ================================= */}

      <Modal
        title={
          sesionSeleccionada
            ? `Detalle de asistencia - Sesion #${sesionSeleccionada.id}`
            : 'Detalle de asistencia'
        }
        open={
          modalAbierto
        }
        onCancel={() =>
          setModalAbierto(
            false,
          )
        }
        footer={[
          <Button
            key="cerrar"
            onClick={() =>
              setModalAbierto(
                false,
              )
            }
          >
            Cerrar
          </Button>,
        ]}
        width={
          1000
        }
      >
        {cargandoDetalle ? (
          <div
            style={{
              textAlign:
                'center',

              padding:
                50,
            }}
          >
            <Spin />
          </div>
        ) : sesionSeleccionada ? (
          <>
            {/* INFORMACION */}

            <Card
              size="small"
              style={{
                marginBottom:
                  20,
              }}
            >
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
                  <Text strong>
                    Clase:
                  </Text>

                  <br />

                  <Text>
                    {
                      obtenerNombreClase(
                        sesionSeleccionada,
                      )
                    }
                  </Text>
                </Col>

                <Col
                  xs={24}
                  md={12}
                >
                  <Text strong>
                    Curso:
                  </Text>

                  <br />

                  <Text>
                    {
                      sesionSeleccionada.codigo_curso
                    }{' '}
                    -{' '}
                    {
                      sesionSeleccionada.curso
                    }
                  </Text>
                </Col>

                <Col
                  xs={12}
                  md={6}
                >
                  <Text strong>
                    Fecha:
                  </Text>

                  <br />

                  <Text>
                    {
                      formatearFecha(
                        sesionSeleccionada.fecha_sesion,
                      )
                    }
                  </Text>
                </Col>

                <Col
                  xs={12}
                  md={6}
                >
                  <Text strong>
                    Inicio:
                  </Text>

                  <br />

                  <Text>
                    {
                      formatearHora(
                        sesionSeleccionada.hora_inicio,
                      )
                    }
                  </Text>
                </Col>

                <Col
                  xs={12}
                  md={6}
                >
                  <Text strong>
                    Fin:
                  </Text>

                  <br />

                  <Text>
                    {
                      formatearHora(
                        sesionSeleccionada.hora_fin,
                      )
                    }
                  </Text>
                </Col>

                <Col
                  xs={12}
                  md={6}
                >
                  <Text strong>
                    Estado:
                  </Text>

                  <br />

                  {
                    etiquetaEstado(
                      sesionSeleccionada.estado,
                    )
                  }
                </Col>
              </Row>
            </Card>

            {/* RESUMEN */}

            <Row
              gutter={[
                16,
                16,
              ]}
              style={{
                marginBottom:
                  20,
              }}
            >
              <Col
                xs={12}
                md={4}
              >
                <Card>
                  <Statistic
                    title="Total"
                    value={
                      sesionSeleccionada
                        .resumen
                        .total_registros
                    }
                  />
                </Card>
              </Col>

              <Col
                xs={12}
                md={4}
              >
                <Card>
                  <Statistic
                    title="Presentes"
                    value={
                      sesionSeleccionada
                        .resumen
                        .presentes
                    }
                  />
                </Card>
              </Col>

              <Col
                xs={12}
                md={4}
              >
                <Card>
                  <Statistic
                    title="Ausentes"
                    value={
                      sesionSeleccionada
                        .resumen
                        .ausentes
                    }
                  />
                </Card>
              </Col>

              <Col
                xs={12}
                md={6}
              >
                <Card>
                  <Statistic
                    title="Asistencia"
                    value={
                      porcentajeSesion(
                        sesionSeleccionada,
                      )
                    }
                    precision={
                      1
                    }
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>

            {/* ESTUDIANTES */}

            <Table
              rowKey="asistencia_id"
              columns={
                columnasDetalle
              }
              dataSource={
                detalle
              }
              pagination={
                false
              }
              locale={{
                emptyText:
                  'Esta sesion no tiene registros de asistencia.',
              }}
              scroll={{
                x:
                  700,
              }}
            />
          </>
        ) : null}
      </Modal>
    </div>
  );
}