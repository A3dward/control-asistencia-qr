import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
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
  // DATOS BASE
  // =====================================

  const [
    asignaciones,
    setAsignaciones,
  ] =
    useState<
      Asignacion[]
    >([]);

  // =====================================
  // RESULTADOS
  // =====================================

  const [
    resultados,
    setResultados,
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
    seccionId,
    setSeccionId,
  ] =
    useState<
      number | undefined
    >(undefined);

  const [
    asignacionId,
    setAsignacionId,
  ] =
    useState<
      number | undefined
    >(undefined);

  const [
    fechaDesde,
    setFechaDesde,
  ] =
    useState('');

  const [
    fechaHasta,
    setFechaHasta,
  ] =
    useState('');

  // =====================================
  // ESTADOS
  // =====================================

  const [
    cargandoAsignaciones,
    setCargandoAsignaciones,
  ] =
    useState(true);

  const [
    buscando,
    setBuscando,
  ] =
    useState(false);

  const [
    consultaRealizada,
    setConsultaRealizada,
  ] =
    useState(false);

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
  // NOMBRE DE CLASE
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
      ? `${datos.grado} - Sección ${datos.seccion} - ${datos.anio_academico}`
      : `${datos.grado} - ${datos.anio_academico}`;
  };

  // =====================================
  // OBTENER FECHA YYYY-MM-DD
  // =====================================

  const obtenerFechaSimple = (
    valor:
      string,
  ) => {
    if (!valor) {
      return '';
    }

    return String(
      valor,
    ).substring(
      0,
      10,
    );
  };

  // =====================================
  // FORMATO FECHA
  // =====================================

  const formatearFecha = (
    valor:
      string,
  ) => {
    const fechaSimple =
      obtenerFechaSimple(
        valor,
      );

    const partes =
      fechaSimple.split(
        '-',
      );

    if (
      partes.length !==
      3
    ) {
      return fechaSimple;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // =====================================
  // FORMATO HORA
  // =====================================

  const formatearHora = (
    valor:
      string | null,
  ) => {
    if (!valor) {
      return '-';
    }

    if (
      /^\d{2}:\d{2}/.test(
        valor,
      )
    ) {
      return valor.substring(
        0,
        5,
      );
    }

    const fechaHora =
      new Date(
        valor,
      );

    if (
      Number.isNaN(
        fechaHora.getTime(),
      )
    ) {
      return valor;
    }

    return fechaHora.toLocaleTimeString(
      'es-GT',
      {
        hour:
          '2-digit',

        minute:
          '2-digit',

        hour12:
          true,

        timeZone:
          'America/Guatemala',
      },
    );
  };

  // =====================================
  // CLASES DEL DOCENTE
  // =====================================

  const clases =
    useMemo(
      () => {
        const mapa =
          new Map<
            number,
            Asignacion
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
  // CURSOS DE LA CLASE
  // =====================================

  const cursos =
    useMemo(
      () =>
        asignaciones.filter(
          (
            asignacion,
          ) =>
            Boolean(
              asignacion.activo,
            ) &&
            Number(
              asignacion.seccion_id,
            ) ===
              Number(
                seccionId,
              ),
        ),
      [
        asignaciones,
        seccionId,
      ],
    );

  // =====================================
  // ASIGNACION SELECCIONADA
  // =====================================

  const asignacionSeleccionada =
    useMemo(
      () =>
        asignaciones.find(
          (
            asignacion,
          ) =>
            Number(
              asignacion.asignacion_id,
            ) ===
              Number(
                asignacionId,
              ),
        ) ??
        null,
      [
        asignaciones,
        asignacionId,
      ],
    );

  // =====================================
  // CARGAR CLASES Y CURSOS
  //
  // ESTA ES LA UNICA CONSULTA
  // AUTOMATICA AL ENTRAR.
  // NO CARGA HISTORIAL.
  // =====================================

  const cargarAsignaciones =
    async () => {
      try {
        setCargandoAsignaciones(
          true,
        );

        const respuesta =
          await api.get(
            '/asignaciones/mis-asignaciones',
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const normalizadas:
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
          normalizadas,
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar sus clases y cursos.',
          ),
        );
      } finally {
        setCargandoAsignaciones(
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
  // LIMPIAR RESULTADO
  // =====================================

  const limpiarResultado =
    () => {
      setResultados(
        [],
      );

      setConsultaRealizada(
        false,
      );
    };

  // =====================================
  // BUSCAR HISTORIAL
  // =====================================

  const buscarHistorial =
    async () => {
      if (
        !seccionId
      ) {
        message.warning(
          'Seleccione una clase.',
        );

        return;
      }

      if (
        !asignacionId
      ) {
        message.warning(
          'Seleccione un curso.',
        );

        return;
      }

      if (
        !fechaDesde
      ) {
        message.warning(
          'Seleccione la fecha inicial.',
        );

        return;
      }

      if (
        !fechaHasta
      ) {
        message.warning(
          'Seleccione la fecha final.',
        );

        return;
      }

      if (
        fechaDesde >
        fechaHasta
      ) {
        message.warning(
          'La fecha inicial no puede ser mayor que la fecha final.',
        );

        return;
      }

      try {
        setBuscando(
          true,
        );

        setResultados(
          [],
        );

        setConsultaRealizada(
          false,
        );

        // =================================
        // SESIONES DEL CURSO
        // =================================

        const respuesta =
          await api.get(
            `/sesiones-clase/asignacion/${asignacionId}`,
          );

        const datos =
          respuesta.data
            .datos ?? [];

        // =================================
        // FILTRAR POR RANGO DE FECHAS
        //
        // NO SE FILTRA POR ESTADO.
        // ABIERTA, CERRADA O CANCELADA
        // PUEDEN APARECER.
        // =================================

        const sesionesFecha =
          datos.filter(
            (
              sesion:
                any,
            ) => {
              const fechaSesion =
                obtenerFechaSimple(
                  sesion.fecha_sesion,
                );

              return (
                fechaSesion >=
                  fechaDesde &&
                fechaSesion <=
                  fechaHasta
              );
            },
          );

        const base:
          SesionHistorial[] =
          sesionesFecha.map(
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
                Number(
                  asignacionSeleccionada
                    ?.asignacion_id ??
                    asignacionId,
                ),

              curso_id:
                Number(
                  asignacionSeleccionada
                    ?.curso_id ??
                    0,
                ),

              codigo_curso:
                asignacionSeleccionada
                  ?.codigo_curso ??
                '',

              curso:
                asignacionSeleccionada
                  ?.curso ??
                '',

              seccion_id:
                Number(
                  asignacionSeleccionada
                    ?.seccion_id ??
                    seccionId,
                ),

              seccion:
                asignacionSeleccionada
                  ?.seccion ??
                '',

              grado:
                asignacionSeleccionada
                  ?.grado ??
                '',

              anio_academico:
                Number(
                  asignacionSeleccionada
                    ?.anio_academico ??
                    0,
                ),

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

        // =================================
        // SOLO CONSULTAMOS RESUMEN
        // DE LAS SESIONES ENCONTRADAS
        // =================================

        const completas =
          await Promise.all(
            base.map(
              async (
                sesion,
              ) => {
                try {
                  const respuestaResumen =
                    await api.get(
                      `/asistencias/sesion/${sesion.id}/resumen`,
                    );

                  const resumen =
                    respuestaResumen
                      .data
                      .datos
                      ?.resumen;

                  return {
                    ...sesion,

                    resumen: {
                      total_registros:
                        Number(
                          resumen
                            ?.total_registros ??
                            0,
                        ),

                      presentes:
                        Number(
                          resumen
                            ?.presentes ??
                            0,
                        ),

                      ausentes:
                        Number(
                          resumen
                            ?.ausentes ??
                            0,
                        ),

                      tarde:
                        Number(
                          resumen
                            ?.tarde ??
                            0,
                        ),

                      justificados:
                        Number(
                          resumen
                            ?.justificados ??
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

        completas.sort(
          (
            a,
            b,
          ) =>
            Number(
              b.id,
            ) -
            Number(
              a.id,
            ),
        );

        setResultados(
          completas,
        );

        setConsultaRealizada(
          true,
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible consultar el historial.',
          ),
        );
      } finally {
        setBuscando(
          false,
        );
      }
    };

  // =====================================
  // LIMPIAR FILTROS
  // =====================================

  const limpiarFiltros =
    () => {
      setSeccionId(
        undefined,
      );

      setAsignacionId(
        undefined,
      );

      setFechaDesde(
        '',
      );

      setFechaHasta(
        '',
      );

      setResultados(
        [],
      );

      setConsultaRealizada(
        false,
      );

      setSesionSeleccionada(
        null,
      );
    };

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
  // COLOR DE ESTADO
  // =====================================

  const colorEstadoSesion =
    (
      estado:
        string,
    ) => {
      if (
        estado ===
        'CERRADA'
      ) {
        return 'green';
      }

      if (
        estado ===
        'ABIERTA'
      ) {
        return 'blue';
      }

      if (
        estado ===
        'CANCELADA'
      ) {
        return 'red';
      }

      return 'default';
    };

  // =====================================
  // COLOR DE ASISTENCIA
  // =====================================

  const colorEstadoAsistencia =
    (
      estado:
        string,
    ) => {
      if (
        estado ===
        'PRESENTE'
      ) {
        return 'green';
      }

      if (
        estado ===
        'AUSENTE'
      ) {
        return 'red';
      }

      if (
        estado ===
        'TARDE'
      ) {
        return 'orange';
      }

      return 'blue';
    };

  // =====================================
  // COLUMNAS RESULTADOS
  // =====================================

  const columnas:
    TableColumnsType<SesionHistorial> =
    [
      {
        title:
          'Fecha',

        dataIndex:
          'fecha_sesion',

        key:
          'fecha_sesion',

        width:
          130,

        render: (
          valor:
            string,
        ) =>
          formatearFecha(
            valor,
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
        ) => (
          <div>
            <Text strong>
              {
                sesion.curso
              }
            </Text>

            <br />

            <Space
              size={6}
              wrap
            >
              <Text
                type="secondary"
                style={{
                  fontSize:
                    12,
                }}
              >
                {
                  obtenerNombreClase(
                    sesion,
                  )
                }
              </Text>

              <Tag
                color={
                  colorEstadoSesion(
                    sesion.estado,
                  )
                }
              >
                {
                  sesion.estado
                }
              </Tag>
            </Space>
          </div>
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
        ) => (
          <Tag
            color="green"
          >
            {
              sesion.resumen
                .presentes
            }
          </Tag>
        ),
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
        ) => (
          <Tag
            color="red"
          >
            {
              sesion.resumen
                .ausentes
            }
          </Tag>
        ),
      },

      {
        title:
          'Detalle',

        key:
          'detalle',

        width:
          120,

        render: (
          _,
          sesion,
        ) => (
          <Button
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
          140,
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
          140,

        render: (
          estado:
            string,
        ) => (
          <Tag
            color={
              colorEstadoAsistencia(
                estado,
              )
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
          170,

        render: (
          _,
          asistencia,
        ) =>
          asistencia.fecha_hora_asistencia
            ? formatearHora(
                asistencia.fecha_hora_asistencia,
              )
            : '-',
      },
    ];

  // =====================================
  // TEXTO DEL PERIODO
  // =====================================

  const textoPeriodo =
    fechaDesde ===
    fechaHasta
      ? formatearFecha(
          fechaDesde,
        )
      : `${formatearFecha(
          fechaDesde,
        )} al ${formatearFecha(
          fechaHasta,
        )}`;

  // =====================================
  // VISTA
  // =====================================

  return (
    <div
      className="pagina-administracion"
    >
      <div>
        {/* ================================= */}
        {/* REGRESAR */}
        {/* ================================= */}

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

        {/* ================================= */}
        {/* ENCABEZADO */}
        {/* ================================= */}

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
            Historial de asistencias
          </Title>

          <Text
            type="secondary"
          >
            Seleccione una clase,
            un curso y el período que
            desea consultar.
          </Text>
        </div>

        {/* ================================= */}
        {/* FILTROS */}
        {/* ================================= */}

        <Card>
          <Row
            gutter={[
              16,
              16,
            ]}
            align="bottom"
          >
            {/* CLASE */}

            <Col
              xs={24}
              lg={5}
            >
              <Text strong>
                Clase
              </Text>

              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione una clase"
                value={
                  seccionId
                }
                loading={
                  cargandoAsignaciones
                }
                disabled={
                  cargandoAsignaciones
                }
                style={{
                  width:
                    '100%',

                  marginTop:
                    7,
                }}
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
                  setSeccionId(
                    Number(
                      valor,
                    ),
                  );

                  setAsignacionId(
                    undefined,
                  );

                  limpiarResultado();
                }}
              />
            </Col>

            {/* CURSO */}

            <Col
              xs={24}
              lg={5}
            >
              <Text strong>
                Curso
              </Text>

              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione un curso"
                value={
                  asignacionId
                }
                disabled={
                  !seccionId
                }
                style={{
                  width:
                    '100%',

                  marginTop:
                    7,
                }}
                options={
                  cursos.map(
                    (
                      curso,
                    ) => ({
                      value:
                        curso.asignacion_id,

                      label:
                        `${curso.codigo_curso} - ${curso.curso}`,
                    }),
                  )
                }
                onChange={(
                  valor,
                ) => {
                  setAsignacionId(
                    Number(
                      valor,
                    ),
                  );

                  limpiarResultado();
                }}
              />
            </Col>

            {/* DESDE */}

            <Col
              xs={24}
              sm={12}
              lg={4}
            >
              <Text strong>
                Desde
              </Text>

              <Input
                type="date"
                prefix={
                  <CalendarOutlined />
                }
                value={
                  fechaDesde
                }
                style={{
                  marginTop:
                    7,
                }}
                onChange={(
                  evento,
                ) => {
                  setFechaDesde(
                    evento.target.value,
                  );

                  limpiarResultado();
                }}
              />
            </Col>

            {/* HASTA */}

            <Col
              xs={24}
              sm={12}
              lg={4}
            >
              <Text strong>
                Hasta
              </Text>

              <Input
                type="date"
                prefix={
                  <CalendarOutlined />
                }
                value={
                  fechaHasta
                }
                style={{
                  marginTop:
                    7,
                }}
                onChange={(
                  evento,
                ) => {
                  setFechaHasta(
                    evento.target.value,
                  );

                  limpiarResultado();
                }}
              />
            </Col>

            {/* ACCIONES */}

            <Col
              xs={24}
              lg={6}
            >
              <Space>
                <Button
                  type="primary"
                  icon={
                    <SearchOutlined />
                  }
                  loading={
                    buscando
                  }
                  onClick={() => {
                    void buscarHistorial();
                  }}
                >
                  Buscar
                </Button>

                <Button
                  onClick={
                    limpiarFiltros
                  }
                >
                  Limpiar
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* ================================= */}
        {/* SIN RESULTADOS */}
        {/* ================================= */}

        {consultaRealizada &&
          resultados.length ===
            0 && (
            <Alert
              type="info"
              showIcon
              message="No se encontraron asistencias para la clase, curso y período seleccionados."
              style={{
                marginTop:
                  20,
              }}
            />
          )}

        {/* ================================= */}
        {/* RESULTADOS */}
        {/* ================================= */}

        {consultaRealizada &&
          resultados.length >
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
                <Title
                  level={4}
                  style={{
                    margin:
                      0,
                  }}
                >
                  {
                    asignacionSeleccionada
                      ?.curso
                  }
                </Title>

                <Text
                  type="secondary"
                >
                  {
                    asignacionSeleccionada
                      ? obtenerNombreClase(
                          asignacionSeleccionada,
                        )
                      : ''
                  }
                  {' · '}
                  {
                    textoPeriodo
                  }
                  {' · '}
                  {
                    resultados.length
                  }{' '}
                  {
                    resultados.length ===
                    1
                      ? 'sesión encontrada'
                      : 'sesiones encontradas'
                  }
                </Text>
              </div>

              <Table
                rowKey="id"
                columns={
                  columnas
                }
                dataSource={
                  resultados
                }
                pagination={
                  false
                }
                scroll={{
                  x:
                    850,
                }}
              />
            </Card>
          )}

        {/* ================================= */}
        {/* MODAL DETALLE */}
        {/* ================================= */}

        <Modal
          title={
            sesionSeleccionada
              ? `Asistencia - ${sesionSeleccionada.curso}`
              : 'Detalle de asistencia'
          }
          open={
            modalAbierto
          }
          width={
            900
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
        >
          {cargandoDetalle ? (
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
          ) : sesionSeleccionada ? (
            <>
              {/* INFORMACION SESION */}

              <Card
                size="small"
                style={{
                  marginBottom:
                    18,
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
                      Clase
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
                      Curso
                    </Text>

                    <br />

                    <Text>
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
                      Fecha
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
                      Inicio
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
                      Fin
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
                      Estado
                    </Text>

                    <br />

                    <Tag
                      color={
                        colorEstadoSesion(
                          sesionSeleccionada.estado,
                        )
                      }
                    >
                      {
                        sesionSeleccionada.estado
                      }
                    </Tag>
                  </Col>
                </Row>
              </Card>

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
                    'Esta sesión todavía no tiene registros de asistencia.',
                }}
                scroll={{
                  x:
                    650,
                }}
              />
            </>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}