import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Input,
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

interface DocenteFiltro {
  docente_id:
    number;

  codigo_docente:
    string;

  docente:
    string;
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

interface GrupoDocente {
  docente_id:
    number;

  codigo_docente:
    string;

  docente:
    string;

  sesiones:
    Sesion[];
}

// =====================================
// COMPONENTE
// =====================================

export default function ReporteAsistenciasAdmin() {
  const navigate =
    useNavigate();

  // =====================================
  // DATOS
  // =====================================

  const [
    sesiones,
    setSesiones,
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
  // FECHA NORMALIZADA
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
      : `${sesion.grado}`;
  };

  // =====================================
  // DOCENTES DISPONIBLES
  // =====================================

  const docentes:
    DocenteFiltro[] =
    useMemo(
      () => {
        const mapa =
          new Map<
            number,
            DocenteFiltro
          >();

        sesiones.forEach(
          (
            sesion,
          ) => {
            mapa.set(
              Number(
                sesion.docente_id,
              ),
              {
                docente_id:
                  Number(
                    sesion.docente_id,
                  ),

                codigo_docente:
                  sesion.codigo_docente,

                docente:
                  sesion.docente,
              },
            );
          },
        );

        return Array.from(
          mapa.values(),
        ).sort(
          (
            a,
            b,
          ) =>
            a.docente.localeCompare(
              b.docente,
              'es',
            ),
        );
      },
      [
        sesiones,
      ],
    );

  // =====================================
  // FILTRAR SESIONES
  // =====================================

  const sesionesFiltradas =
    useMemo(
      () =>
        sesiones.filter(
          (
            sesion,
          ) => {
            // No incluir sesiones
            // canceladas en reportes.

            if (
              sesion.estado ===
              'CANCELADA'
            ) {
              return false;
            }

            const cumpleDocente =
              !docenteId ||
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

            const cumpleDesde =
              !fechaDesde ||
              fecha >=
                fechaDesde;

            const cumpleHasta =
              !fechaHasta ||
              fecha <=
                fechaHasta;

            return (
              cumpleDocente &&
              cumpleDesde &&
              cumpleHasta
            );
          },
        ),
      [
        sesiones,
        docenteId,
        fechaDesde,
        fechaHasta,
      ],
    );

  // =====================================
  // AGRUPAR POR DOCENTE
  // =====================================

  const gruposDocentes:
    GrupoDocente[] =
    useMemo(
      () => {
        const mapa =
          new Map<
            number,
            GrupoDocente
          >();

        sesionesFiltradas.forEach(
          (
            sesion,
          ) => {
            const id =
              Number(
                sesion.docente_id,
              );

            if (
              !mapa.has(
                id,
              )
            ) {
              mapa.set(
                id,
                {
                  docente_id:
                    id,

                  codigo_docente:
                    sesion.codigo_docente,

                  docente:
                    sesion.docente,

                  sesiones:
                    [],
                },
              );
            }

            mapa
              .get(
                id,
              )
              ?.sesiones.push(
                sesion,
              );
          },
        );

        const grupos =
          Array.from(
            mapa.values(),
          );

        grupos.forEach(
          (
            grupo,
          ) => {
            grupo.sesiones.sort(
              (
                a,
                b,
              ) => {
                const fechaA =
                  `${obtenerFechaSimple(
                    a.fecha_sesion,
                  )}-${a.hora_inicio}`;

                const fechaB =
                  `${obtenerFechaSimple(
                    b.fecha_sesion,
                  )}-${b.hora_inicio}`;

                return fechaB.localeCompare(
                  fechaA,
                );
              },
            );
          },
        );

        return grupos.sort(
          (
            a,
            b,
          ) =>
            a.docente.localeCompare(
              b.docente,
              'es',
            ),
        );
      },
      [
        sesionesFiltradas,
      ],
    );

  // =====================================
  // TOTALES
  // =====================================

  const totalSesiones =
    sesionesFiltradas.length;

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

  // =====================================
  // PORCENTAJE DE SESION
  // =====================================

  const porcentaje = (
    sesion:
      Sesion,
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
  // CARGAR REPORTE
  // =====================================

  const cargarReporte =
    async () => {
      try {
        setCargando(
          true,
        );

        // =================================
        // TODAS LAS SESIONES
        // =================================

        const respuesta =
          await api.get(
            '/sesiones-clase',
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const sesionesBase:
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
        // RESUMEN DE CADA SESION
        // =================================

        const completas =
          await Promise.all(
            sesionesBase.map(
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

        setSesiones(
          completas,
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar el reporte de asistencias.',
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
      void cargarReporte();
    },
    [],
  );

  // =====================================
  // LIMPIAR FILTROS
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
    };

  // =====================================
  // ABRIR DETALLE
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
  // COLUMNAS SESIONES
  // =====================================

  const columnasSesiones:
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
          120,

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
          </div>
        ),
      },

      {
        title:
          'Horario',

        key:
          'horario',

        width:
          180,

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
          105,

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
          105,

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
          'Asistencia',

        key:
          'porcentaje',

        width:
          115,

        align:
          'center',

        render: (
          _,
          sesion,
        ) =>
          `${porcentaje(
            sesion,
          ).toFixed(
            1,
          )}%`,
      },

      {
        title:
          'Estado',

        dataIndex:
          'estado',

        key:
          'estado',

        width:
          110,

        render: (
          estado:
            string,
        ) => (
          <Tag
            color={
              estado ===
              'CERRADA'
                ? 'green'
                : 'blue'
            }
          >
            {
              estado
            }
          </Tag>
        ),
      },

      {
        title:
          '',

        key:
          'accion',

        width:
          115,

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
            Detalle
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
              estado ===
              'PRESENTE'
                ? 'green'
                : 'red'
            }
          >
            {
              estado
            }
          </Tag>
        ),
      },

      {
        title:
          'Hora',

        key:
          'hora',

        width:
          150,

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
      className="pagina-administracion"
    >
      <div>
        {/* ================================= */}
        {/* ENCABEZADO */}
        {/* ================================= */}

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

        <div
          className="pagina-encabezado"
        >
          <div>
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
              Consulte las clases
              impartidas por cada
              docente y los resultados
              de asistencia por fecha.
            </Text>
          </div>

          <Button
            icon={
              <ReloadOutlined />
            }
            onClick={() => {
              void cargarReporte();
            }}
          >
            Actualizar
          </Button>
        </div>

        {/* ================================= */}
        {/* FILTROS */}
        {/* ================================= */}

        <Card
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
            align="bottom"
          >
            <Col
              xs={24}
              lg={10}
            >
              <Text strong>
                Docente
              </Text>

              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Todos los docentes"
                value={
                  docenteId
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
                        docente.docente_id,

                      label:
                        `${docente.codigo_docente} - ${docente.docente}`,
                    }),
                  )
                }
                onChange={
                  setDocenteId
                }
              />
            </Col>

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
                value={
                  fechaDesde
                }
                onChange={(
                  evento,
                ) =>
                  setFechaDesde(
                    evento.target.value,
                  )
                }
                prefix={
                  <CalendarOutlined />
                }
                style={{
                  marginTop:
                    7,
                }}
              />
            </Col>

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
                value={
                  fechaHasta
                }
                onChange={(
                  evento,
                ) =>
                  setFechaHasta(
                    evento.target.value,
                  )
                }
                prefix={
                  <CalendarOutlined />
                }
                style={{
                  marginTop:
                    7,
                }}
              />
            </Col>

            <Col
              xs={24}
              lg={4}
            >
              <Button
                block
                onClick={
                  limpiarFiltros
                }
              >
                Limpiar filtros
              </Button>
            </Col>
          </Row>

          {fechaDesde &&
            fechaHasta &&
            fechaDesde >
              fechaHasta && (
              <Alert
                type="warning"
                showIcon
                message="La fecha inicial no puede ser mayor que la fecha final."
                style={{
                  marginTop:
                    16,
                }}
              />
            )}
        </Card>

        {/* ================================= */}
        {/* TOTALES */}
        {/* ================================= */}

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
            md={6}
          >
            <Card>
              <Statistic
                title="Docentes"
                value={
                  gruposDocentes.length
                }
                prefix={
                  <TeamOutlined />
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
                title="Sesiones"
                value={
                  totalSesiones
                }
                prefix={
                  <FileTextOutlined />
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
        {/* RESULTADOS */}
        {/* ================================= */}

        {cargando ? (
          <Card>
            <div
              style={{
                display:
                  'flex',

                justifyContent:
                  'center',

                padding:
                  60,
              }}
            >
              <Spin
                size="large"
              />
            </div>
          </Card>
        ) : gruposDocentes.length ===
          0 ? (
          <Alert
            type="info"
            showIcon
            message="No se encontraron asistencias para los filtros seleccionados."
          />
        ) : (
          gruposDocentes.map(
            (
              grupo,
            ) => {
              const presentesDocente =
                grupo.sesiones.reduce(
                  (
                    total,
                    sesion,
                  ) =>
                    total +
                    Number(
                      sesion.resumen
                        .presentes,
                    ),
                  0,
                );

              const ausentesDocente =
                grupo.sesiones.reduce(
                  (
                    total,
                    sesion,
                  ) =>
                    total +
                    Number(
                      sesion.resumen
                        .ausentes,
                    ),
                  0,
                );

              return (
                <Card
                  key={
                    grupo.docente_id
                  }
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
                    align="middle"
                  >
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Space
                        align="start"
                      >
                        <TeamOutlined
                          style={{
                            fontSize:
                              22,

                            color:
                              '#1f4e68',

                            marginTop:
                              4,
                          }}
                        />

                        <div>
                          <Title
                            level={4}
                            style={{
                              margin:
                                0,
                            }}
                          >
                            {
                              grupo.docente
                            }
                          </Title>

                          <Text
                            type="secondary"
                          >
                            {
                              grupo.codigo_docente
                            }
                          </Text>
                        </div>
                      </Space>
                    </Col>

                    <Col
                      xs={8}
                      md={4}
                    >
                      <Statistic
                        title="Cursos / sesiones"
                        value={
                          grupo.sesiones.length
                        }
                      />
                    </Col>

                    <Col
                      xs={8}
                      md={4}
                    >
                      <Statistic
                        title="Presentes"
                        value={
                          presentesDocente
                        }
                      />
                    </Col>

                    <Col
                      xs={8}
                      md={4}
                    >
                      <Statistic
                        title="Ausentes"
                        value={
                          ausentesDocente
                        }
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <Table
                    rowKey="id"
                    columns={
                      columnasSesiones
                    }
                    dataSource={
                      grupo.sesiones
                    }
                    pagination={
                      false
                    }
                    scroll={{
                      x:
                        1050,
                    }}
                  />
                </Card>
              );
            },
          )
        )}

        {/* ================================= */}
        {/* DETALLE */}
        {/* ================================= */}

        <Modal
          title={
            sesionSeleccionada
              ? `Detalle de asistencia - ${sesionSeleccionada.curso}`
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
            950
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
                  xs={8}
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
                  xs={8}
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
                  xs={8}
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
              </Row>

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