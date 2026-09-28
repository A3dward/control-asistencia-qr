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

interface Docente {
  id:
    number;

  codigo_docente:
    string;

  nombre_completo:
    string;

  activo:
    boolean;
}

interface ResumenSesion {
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

interface Sesion {
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

  docente_id:
    number;

  codigo_docente:
    string;

  docente:
    string;

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
    ResumenSesion;
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

export default function ReporteAsistenciasAdmin() {
  const navigate =
    useNavigate();

  // =====================================
  // DOCENTES
  // =====================================

  const [
    docentes,
    setDocentes,
  ] =
    useState<
      Docente[]
    >([]);

  // =====================================
  // RESULTADOS
  // =====================================

  const [
    resultados,
    setResultados,
  ] =
    useState<
      Sesion[]
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
      Sesion | null
    >(null);

  // =====================================
  // FILTROS
  // =====================================

  const [
    docenteId,
    setDocenteId,
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
    cargandoDocentes,
    setCargandoDocentes,
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
  // ERROR
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
  // FECHA SIMPLE
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
    const fecha =
      obtenerFechaSimple(
        valor,
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

        hour12:
          true,

        timeZone:
          'America/Guatemala',
      },
    );
  };

  // =====================================
  // NOMBRE CLASE
  // =====================================

  const obtenerNombreClase = (
    sesion:
      Sesion,
  ) => {
    const mostrarSeccion =
      sesion.seccion &&
      sesion.seccion
        .toLowerCase() !==
        'general';

    return mostrarSeccion
      ? `${sesion.grado} - Sección ${sesion.seccion}`
      : sesion.grado;
  };

  // =====================================
  // DOCENTE SELECCIONADO
  // =====================================

  const docenteSeleccionado =
    useMemo(
      () =>
        docentes.find(
          (
            docente,
          ) =>
            Number(
              docente.id,
            ) ===
              Number(
                docenteId,
              ),
        ) ??
        null,
      [
        docentes,
        docenteId,
      ],
    );

  // =====================================
  // CARGAR DOCENTES
  //
  // SOLO CARGA EL CATALOGO.
  // NO CARGA ASISTENCIAS.
  // =====================================

  const cargarDocentes =
    async () => {
      try {
        setCargandoDocentes(
          true,
        );

        const respuesta =
          await api.get(
            '/docentes',
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const normalizados:
          Docente[] =
          datos.map(
            (
              docente:
                any,
            ) => ({
              id:
                Number(
                  docente.id,
                ),

              codigo_docente:
                docente.codigo_docente,

              nombre_completo:
                docente.nombre_completo,

              activo:
                Boolean(
                  docente.activo,
                ),
            }),
          );

        setDocentes(
          normalizados,
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar los docentes.',
          ),
        );
      } finally {
        setCargandoDocentes(
          false,
        );
      }
    };

  // =====================================
  // INICIO
  // =====================================

  useEffect(
    () => {
      void cargarDocentes();
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
  // BUSCAR REPORTE
  // =====================================

  const buscarReporte =
    async () => {
      if (
        !docenteId
      ) {
        message.warning(
          'Seleccione un docente.',
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
        // OBTENER SESIONES
        // =================================

        const respuesta =
          await api.get(
            '/sesiones-clase',
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const sesiones:
          Sesion[] =
          datos.map(
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

              docente_id:
                Number(
                  sesion.docente_id,
                ),

              curso_id:
                Number(
                  sesion.curso_id,
                ),

              seccion_id:
                Number(
                  sesion.seccion_id,
                ),

              anio_academico:
                Number(
                  sesion.anio_academico,
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
        // FILTRAR POR DOCENTE Y FECHA
        //
        // IMPORTANTE:
        // NO FILTRAMOS POR ESTADO.
        // =================================

        const encontradas =
          sesiones.filter(
            (
              sesion,
            ) => {
              const esDocente =
                Number(
                  sesion.docente_id,
                ) ===
                  Number(
                    docenteId,
                  );

              const fecha =
                obtenerFechaSimple(
                  sesion.fecha_sesion,
                );

              const dentroPeriodo =
                fecha >=
                  fechaDesde &&
                fecha <=
                  fechaHasta;

              return (
                esDocente &&
                dentroPeriodo
              );
            },
          );

        // =================================
        // RESUMEN SOLO DE RESULTADOS
        // =================================

        const completas =
          await Promise.all(
            encontradas.map(
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
            'No fue posible consultar el reporte.',
          ),
        );
      } finally {
        setBuscando(
          false,
        );
      }
    };

  // =====================================
  // LIMPIAR
  // =====================================

  const limpiarFiltros =
    () => {
      setDocenteId(
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
  // DETALLE
  // =====================================

  const abrirDetalle =
    async (
      sesion:
        Sesion,
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
  // COLOR SESION
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
  // COLOR ASISTENCIA
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
  // COLUMNAS REPORTE
  // =====================================

  const columnas:
    TableColumnsType<Sesion> =
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
                  sesion.codigo_curso
                }
                {' · '}
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
  // TEXTO PERIODO
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
        {/* REGRESAR */}

        <Button
          type="text"
          icon={
            <ArrowLeftOutlined />
          }
          className="boton-regresar"
          onClick={() =>
            navigate(
              '/admin',
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
            Reporte de asistencias
          </Title>

          <Text
            type="secondary"
          >
            Consulte las sesiones
            realizadas por un docente
            dentro de un período.
          </Text>
        </div>

        {/* BUSQUEDA */}

        <Card>
          <Row
            gutter={[
              16,
              16,
            ]}
            align="bottom"
          >
            {/* DOCENTE */}

            <Col
              xs={24}
              lg={9}
            >
              <Text strong>
                Docente
              </Text>

              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione un docente"
                value={
                  docenteId
                }
                loading={
                  cargandoDocentes
                }
                disabled={
                  cargandoDocentes
                }
                style={{
                  width:
                    '100%',

                  marginTop:
                    7,
                }}
                options={
                  docentes.map(
                    (
                      docente,
                    ) => ({
                      value:
                        docente.id,

                      label:
                        `${docente.codigo_docente} - ${docente.nombre_completo}`,
                    }),
                  )
                }
                onChange={(
                  valor,
                ) => {
                  setDocenteId(
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
              lg={5}
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
              lg={5}
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
              lg={5}
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
                    void buscarReporte();
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

        {/* SIN RESULTADOS */}

        {consultaRealizada &&
          resultados.length ===
            0 && (
            <Alert
              type="info"
              showIcon
              message="No se encontraron asistencias para el docente y período seleccionados."
              style={{
                marginTop:
                  20,
              }}
            />
          )}

        {/* RESULTADOS */}

        {consultaRealizada &&
          resultados.length >
            0 &&
          docenteSeleccionado && (
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
                    docenteSeleccionado.nombre_completo
                  }
                  {' · '}
                  {
                    docenteSeleccionado.codigo_docente
                  }
                </Title>

                <Text
                  type="secondary"
                >
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
                  resultados.length >
                  10
                    ? {
                        pageSize:
                          10,
                      }
                    : false
                }
                scroll={{
                  x:
                    850,
                }}
              />
            </Card>
          )}

        {/* DETALLE */}

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
                      Docente
                    </Text>

                    <br />

                    <Text>
                      {
                        sesionSeleccionada.docente
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

                  <Col
                    xs={24}
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
                </Row>
              </Card>

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