import {
  ArrowLeftOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Col,
  message,
  Popconfirm,
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
  Html5Qrcode,
} from 'html5-qrcode';

import {
  useEffect,
  useMemo,
  useRef,
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

interface Clase {
  seccion_id:
    number;

  seccion:
    string;

  grado:
    string;

  anio_academico:
    number;
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

interface SesionClase {
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
    | 'ABIERTA'
    | 'CERRADA'
    | 'CANCELADA';
}

interface Asistencia {
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

interface FilaEstudiante {
  estudiante_id:
    number;

  codigo_estudiante:
    string;

  nombres:
    string;

  apellidos:
    string;

  estado:
    string;

  fecha_hora_asistencia:
    string | null;
}

// =====================================
// COMPONENTE
// =====================================

export default function TomarAsistencia() {
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
    estudiantes,
    setEstudiantes,
  ] =
    useState<
      EstudianteClase[]
    >([]);

  const [
    asistencias,
    setAsistencias,
  ] =
    useState<
      Asistencia[]
    >([]);

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
    sesionActiva,
    setSesionActiva,
  ] =
    useState<
      SesionClase | null
    >(null);

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
    iniciando,
    setIniciando,
  ] =
    useState(false);

  const [
    cerrando,
    setCerrando,
  ] =
    useState(false);

  const [
    camaraLista,
    setCamaraLista,
  ] =
    useState(false);

  const [
    camaraError,
    setCamaraError,
  ] =
    useState<
      string | null
    >(null);

  const [
    ultimoEstudiante,
    setUltimoEstudiante,
  ] =
    useState<
      string | null
    >(null);

  // =====================================
  // REFERENCIAS
  // =====================================

  const scannerRef =
    useRef<
      Html5Qrcode | null
    >(null);

  const scannerActivoRef =
    useRef(false);

  const procesandoQrRef =
    useRef(false);

  const sesionActivaRef =
    useRef<
      SesionClase | null
    >(null);

  const ultimoQrRef =
    useRef<{
      codigo:
        string;

      momento:
        number;
    }>({
      codigo:
        '',

      momento:
        0,
    });

  // =====================================
  // SINCRONIZAR REF DE SESION
  // =====================================

  useEffect(
    () => {
      sesionActivaRef.current =
        sesionActiva;
    },
    [
      sesionActiva,
    ],
  );

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
  // NOMBRE CLASE
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
      ? `${clase.grado} - Seccion ${clase.seccion} - ${clase.anio_academico}`
      : `${clase.grado} - ${clase.anio_academico}`;
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
            Clase
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
                  seccion_id:
                    Number(
                      asignacion.seccion_id,
                    ),

                  seccion:
                    asignacion.seccion,

                  grado:
                    asignacion.grado,

                  anio_academico:
                    Number(
                      asignacion.anio_academico,
                    ),
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
  // CURSOS DE CLASE
  // =====================================

  const cursosDeClase =
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
  // MAPA DE ASISTENCIAS
  // =====================================

  const asistenciaPorEstudiante =
    useMemo(
      () => {
        const mapa =
          new Map<
            number,
            Asistencia
          >();

        asistencias.forEach(
          (
            asistencia,
          ) => {
            mapa.set(
              Number(
                asistencia.estudiante_id,
              ),
              asistencia,
            );
          },
        );

        return mapa;
      },
      [
        asistencias,
      ],
    );

  // =====================================
  // FILAS ESTUDIANTES
  // =====================================

  const filasEstudiantes:
    FilaEstudiante[] =
    useMemo(
      () =>
        estudiantes.map(
          (
            estudiante,
          ) => {
            const asistencia =
              asistenciaPorEstudiante.get(
                Number(
                  estudiante.estudiante_id,
                ),
              );

            return {
              estudiante_id:
                estudiante.estudiante_id,

              codigo_estudiante:
                estudiante.codigo_estudiante,

              nombres:
                estudiante.nombres,

              apellidos:
                estudiante.apellidos,

              estado:
                asistencia
                  ?.estado ??
                'PENDIENTE',

              fecha_hora_asistencia:
                asistencia
                  ?.fecha_hora_asistencia ??
                null,
            };
          },
        ),
      [
        estudiantes,
        asistenciaPorEstudiante,
      ],
    );

  // =====================================
  // CONTADORES
  // =====================================

  const presentes =
    filasEstudiantes.filter(
      (
        estudiante,
      ) =>
        estudiante.estado ===
        'PRESENTE',
    ).length;

  const ausentes =
    filasEstudiantes.filter(
      (
        estudiante,
      ) =>
        estudiante.estado ===
        'AUSENTE',
    ).length;

  const pendientes =
    filasEstudiantes.filter(
      (
        estudiante,
      ) =>
        estudiante.estado ===
        'PENDIENTE',
    ).length;

  const totalEstudiantes =
    filasEstudiantes.length;

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
        setCargando(
          false,
        );
      }
    };

  // =====================================
  // ESTUDIANTES DE LA CLASE
  // =====================================

  const cargarEstudiantesClase =
    async (
      claseId:
        number,
    ) => {
      try {
        setCargandoEstudiantes(
          true,
        );

        const respuesta =
          await api.get(
            `/inscripciones/mi-seccion/${claseId}`,
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
              ...estudiante,

              inscripcion_id:
                Number(
                  estudiante.inscripcion_id,
                ),

              estudiante_id:
                Number(
                  estudiante.estudiante_id,
                ),

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

        setEstudiantes(
          normalizados,
        );
      } catch (
        error
      ) {
        setEstudiantes(
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
  // ASISTENCIAS DE SESION
  // =====================================

  const cargarAsistencias =
    async (
      sesionId:
        number,
    ) => {
      try {
        const respuesta =
          await api.get(
            `/asistencias/sesion/${sesionId}`,
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const normalizadas:
          Asistencia[] =
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

        setAsistencias(
          normalizadas,
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar la asistencia.',
          ),
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
  // DETENER CAMARA
  // =====================================

  const detenerCamara =
    async () => {
      const scanner =
        scannerRef.current;

      if (!scanner) {
        setCamaraLista(
          false,
        );

        return;
      }

      try {
        if (
          scannerActivoRef.current
        ) {
          await scanner.stop();
        }
      } catch {
        // La camara puede estar
        // detenida previamente.
      }

      try {
        scanner.clear();
      } catch {
        // Sin accion.
      }

      scannerActivoRef.current =
        false;

      scannerRef.current =
        null;

      setCamaraLista(
        false,
      );
    };

  // =====================================
  // REGISTRAR QR
  // =====================================

  const registrarQr =
    async (
      codigoQr:
        string,
    ) => {
      const sesion =
        sesionActivaRef.current;

      if (
        !sesion ||
        sesion.estado !==
          'ABIERTA'
      ) {
        return;
      }

      if (
        procesandoQrRef.current
      ) {
        return;
      }

      const ahora =
        Date.now();

      // =================================
      // EVITAR QUE LA CAMARA LEA
      // EL MISMO QR MUCHAS VECES
      // EN MILISEGUNDOS
      // =================================

      if (
        ultimoQrRef.current
          .codigo ===
          codigoQr &&
        ahora -
          ultimoQrRef.current
            .momento <
          2500
      ) {
        return;
      }

      ultimoQrRef.current =
        {
          codigo:
            codigoQr,

          momento:
            ahora,
        };

      procesandoQrRef.current =
        true;

      try {
        const respuesta =
          await api.post(
            '/asistencias/escanear',
            {
              sesion_clase_id:
                Number(
                  sesion.id,
                ),

              codigo_qr:
                codigoQr,
            },
          );

        const datos =
          respuesta.data
            .datos;

        const nueva:
          Asistencia =
          {
            asistencia_id:
              Number(
                datos.asistencia.id,
              ),

            sesion_clase_id:
              Number(
                datos.asistencia
                  .sesion_clase_id,
              ),

            estudiante_id:
              Number(
                datos.estudiante.id,
              ),

            fecha_hora_asistencia:
              datos.asistencia
                .fecha_hora_asistencia,

            estado:
              datos.asistencia
                .estado,

            codigo_estudiante:
              datos.estudiante
                .codigo_estudiante,

            nombres:
              datos.estudiante
                .nombres,

            apellidos:
              datos.estudiante
                .apellidos,
          };

        setAsistencias(
          (
            actuales,
          ) => {
            const existe =
              actuales.some(
                (
                  asistencia,
                ) =>
                  Number(
                    asistencia.estudiante_id,
                  ) ===
                  Number(
                    nueva.estudiante_id,
                  ),
              );

            if (
              existe
            ) {
              return actuales;
            }

            return [
              ...actuales,
              nueva,
            ];
          },
        );

        const nombre =
          `${datos.estudiante.nombres} ${datos.estudiante.apellidos}`;

        setUltimoEstudiante(
          nombre,
        );

        message.success(
          `${nombre} registrado como PRESENTE`,
          1.5,
        );
      } catch (
        error
      ) {
        const texto =
          obtenerMensajeError(
            error,
            'No fue posible registrar la asistencia.',
          );

        if (
          axios.isAxiosError(
            error,
          ) &&
          error.response
            ?.status ===
            409
        ) {
          message.warning(
            texto,
            1.5,
          );
        } else {
          message.error(
            texto,
            2,
          );
        }
      } finally {
        window.setTimeout(
          () => {
            procesandoQrRef.current =
              false;
          },
          350,
        );
      }
    };

  // =====================================
  // INICIAR CAMARA
  // =====================================

  const iniciarCamara =
    async () => {
      const sesion =
        sesionActivaRef.current;

      if (
        !sesion ||
        sesion.estado !==
          'ABIERTA'
      ) {
        return;
      }

      if (
        scannerRef.current
      ) {
        return;
      }

      setCamaraError(
        null,
      );

      setCamaraLista(
        false,
      );

      const scanner =
        new Html5Qrcode(
          'lector-qr-asistencia',
        );

      scannerRef.current =
        scanner;

      try {
        await scanner.start(
          {
            facingMode:
              'environment',
          },
          {
            fps:
              10,

            qrbox: {
              width:
                250,

              height:
                250,
            },

            aspectRatio:
              1,
          },
          (
            textoDecodificado,
          ) => {
            void registrarQr(
              textoDecodificado,
            );
          },
          () => {
            // Los intentos sin QR
            // son normales.
          },
        );

        scannerActivoRef.current =
          true;

        setCamaraLista(
          true,
        );
      } catch (
        error
      ) {
        try {
          scanner.clear();
        } catch {
          // Sin accion.
        }

        scannerRef.current =
          null;

        scannerActivoRef.current =
          false;

        setCamaraLista(
          false,
        );

        setCamaraError(
          obtenerMensajeError(
            error,
            'No fue posible abrir la camara. Verifique que el navegador tenga permiso para utilizarla.',
          ),
        );
      }
    };

  // =====================================
  // ARRANCAR CAMARA AL ABRIR SESION
  // =====================================

  useEffect(
    () => {
      if (
        sesionActiva?.estado !==
        'ABIERTA'
      ) {
        return;
      }

      const temporizador =
        window.setTimeout(
          () => {
            void iniciarCamara();
          },
          250,
        );

      return () => {
        window.clearTimeout(
          temporizador,
        );
      };
    },
    [
      sesionActiva?.id,
      sesionActiva?.estado,
    ],
  );

  // =====================================
  // LIMPIEZA AL SALIR
  // =====================================

  useEffect(
    () => {
      return () => {
        const scanner =
          scannerRef.current;

        if (
          !scanner
        ) {
          return;
        }

        if (
          scannerActivoRef.current
        ) {
          void scanner
            .stop()
            .catch(
              () => {},
            )
            .finally(
              () => {
                try {
                  scanner.clear();
                } catch {
                  // Sin accion.
                }
              },
            );
        }
      };
    },
    [],
  );

  // =====================================
  // CAMBIAR CLASE
  // =====================================

  const seleccionarClase =
    async (
      valor:
        number,
    ) => {
      setSeccionId(
        Number(
          valor,
        ),
      );

      setAsignacionId(
        undefined,
      );

      setSesionActiva(
        null,
      );

      setAsistencias(
        [],
      );

      setUltimoEstudiante(
        null,
      );

      setCamaraError(
        null,
      );

      await cargarEstudiantesClase(
        Number(
          valor,
        ),
      );
    };

  // =====================================
  // CAMBIAR CURSO
  // =====================================

  const seleccionarCurso =
    (
      valor:
        number,
    ) => {
      setAsignacionId(
        Number(
          valor,
        ),
      );

      setSesionActiva(
        null,
      );

      setAsistencias(
        [],
      );

      setUltimoEstudiante(
        null,
      );

      setCamaraError(
        null,
      );
    };

  // =====================================
  // INICIAR ASISTENCIA
  // =====================================

  const iniciarAsistencia =
    async () => {
      if (
        !asignacionSeleccionada
      ) {
        message.warning(
          'Seleccione la clase y el curso.',
        );

        return;
      }

      if (
        estudiantes.length ===
        0
      ) {
        message.warning(
          'Esta clase no tiene estudiantes activos registrados.',
        );

        return;
      }

      try {
        setIniciando(
          true,
        );

        setAsistencias(
          [],
        );

        setUltimoEstudiante(
          null,
        );

        setCamaraError(
          null,
        );

        // =================================
        // VERIFICAR SI YA HAY UNA
        // SESION ABIERTA
        // =================================

        const respuestaSesiones =
          await api.get(
            `/sesiones-clase/asignacion/${asignacionSeleccionada.asignacion_id}`,
          );

        const sesiones =
          respuestaSesiones
            .data
            .datos ?? [];

        const abierta =
          sesiones.find(
            (
              sesion:
                any,
            ) =>
              sesion.estado ===
              'ABIERTA',
          );

        // =================================
        // CONTINUAR SESION EXISTENTE
        // =================================

        if (
          abierta
        ) {
          const existente:
            SesionClase =
            {
              ...abierta,

              id:
                Number(
                  abierta.id,
                ),

              asignacion_docente_id:
                Number(
                  abierta.asignacion_docente_id,
                ),
            };

          setSesionActiva(
            existente,
          );

          await cargarAsistencias(
            existente.id,
          );

          message.info(
            'Ya existia una asistencia abierta para este curso. Se continuara con la misma.',
          );

          return;
        }

        // =================================
        // NUEVA SESION
        // =================================

        const respuesta =
          await api.post(
            '/sesiones-clase',
            {
              asignacion_docente_id:
                Number(
                  asignacionSeleccionada.asignacion_id,
                ),
            },
          );

        const datos =
          respuesta.data
            .datos;

        const nuevaSesion:
          SesionClase =
          {
            ...datos,

            id:
              Number(
                datos.id,
              ),

            asignacion_docente_id:
              Number(
                datos.asignacion_docente_id,
              ),
          };

        setSesionActiva(
          nuevaSesion,
        );

        message.success(
          'Asistencia iniciada correctamente.',
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible iniciar la asistencia.',
          ),
        );
      } finally {
        setIniciando(
          false,
        );
      }
    };

  // =====================================
  // CERRAR ASISTENCIA
  // =====================================

  const cerrarAsistencia =
    async () => {
      const sesion =
        sesionActivaRef.current;

      if (
        !sesion
      ) {
        return;
      }

      try {
        setCerrando(
          true,
        );

        await detenerCamara();

        const respuesta =
          await api.patch(
            `/sesiones-clase/${sesion.id}/cerrar`,
          );

        const datos =
          respuesta.data
            .datos;

        const cerrada:
          SesionClase =
          {
            ...datos,

            id:
              Number(
                datos.id,
              ),

            asignacion_docente_id:
              Number(
                datos.asignacion_docente_id,
              ),
          };

        setSesionActiva(
          cerrada,
        );

        await cargarAsistencias(
          cerrada.id,
        );

        message.success(
          'Asistencia cerrada correctamente.',
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cerrar la asistencia.',
          ),
        );
      } finally {
        setCerrando(
          false,
        );
      }
    };

  // =====================================
  // CANCELAR
  // =====================================

  const cancelarAsistencia =
    async () => {
      const sesion =
        sesionActivaRef.current;

      if (
        !sesion
      ) {
        return;
      }

      try {
        await detenerCamara();

        await api.patch(
          `/sesiones-clase/${sesion.id}/cancelar`,
        );

        setSesionActiva(
          null,
        );

        setAsistencias(
          [],
        );

        setUltimoEstudiante(
          null,
        );

        setCamaraError(
          null,
        );

        message.success(
          'Sesion cancelada correctamente.',
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cancelar la sesion.',
          ),
        );
      }
    };

  // =====================================
  // OTRA ASISTENCIA
  // =====================================

  const tomarOtraAsistencia =
    () => {
      setAsignacionId(
        undefined,
      );

      setSesionActiva(
        null,
      );

      setAsistencias(
        [],
      );

      setUltimoEstudiante(
        null,
      );

      setCamaraError(
        null,
      );
    };

  // =====================================
  // FORMATO HORA
  // =====================================

  const formatoHora =
    (
      fecha:
        string | null,
    ) => {
      if (
        !fecha
      ) {
        return '-';
      }

      return new Date(
        fecha,
      ).toLocaleTimeString(
        'es-GT',
        {
          hour:
            '2-digit',

          minute:
            '2-digit',

          second:
            '2-digit',
        },
      );
    };

  // =====================================
  // COLUMNAS
  // =====================================

  const columnas:
    TableColumnsType<FilaEstudiante> =
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
          estudiante,
        ) =>
          `${estudiante.nombres} ${estudiante.apellidos}`,
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
        ) => {
          if (
            estado ===
            'PRESENTE'
          ) {
            return (
              <Tag
                color="green"
              >
                PRESENTE
              </Tag>
            );
          }

          if (
            estado ===
            'AUSENTE'
          ) {
            return (
              <Tag
                color="red"
              >
                AUSENTE
              </Tag>
            );
          }

          return (
            <Tag
              color="orange"
            >
              PENDIENTE
            </Tag>
          );
        },
      },

      {
        title:
          'Hora',

        key:
          'hora',

        width:
          140,

        render: (
          _,
          estudiante,
        ) =>
          formatoHora(
            estudiante.fecha_hora_asistencia,
          ),
      },
    ];

  // =====================================
  // CARGANDO
  // =====================================

  if (
    cargando
  ) {
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

  // =====================================
  // VISTA
  // =====================================

  return (
    <div
      style={{
        maxWidth:
          1200,

        margin:
          '0 auto',

        padding:
          24,
      }}
    >
      {/* ================================= */}
      {/* ENCABEZADO */}
      {/* ================================= */}

      <Button
        icon={
          <ArrowLeftOutlined />
        }
        disabled={
          sesionActiva
            ?.estado ===
          'ABIERTA'
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

      <Title
        level={2}
        style={{
          marginBottom:
            4,
        }}
      >
        Tomar asistencia
      </Title>

      <Text
        type="secondary"
      >
        Seleccione una de sus
        clases y el curso en el
        que desea registrar la
        asistencia.
      </Text>

      {/* ================================= */}
      {/* CONFIGURACION */}
      {/* ================================= */}

      <Card
        title={
          <Space>
            <QrcodeOutlined />

            Configurar asistencia
          </Space>
        }
        style={{
          marginTop:
            24,

          marginBottom:
            24,
        }}
      >
        {clases.length ===
        0 ? (
          <Alert
            type="warning"
            showIcon
            message="No tiene clases asignadas."
            description="El administrador debe asignarle una clase antes de tomar asistencia."
          />
        ) : (
          <>
            <Row
              gutter={[
                16,
                16,
              ]}
            >
              {/* CLASE */}

              <Col
                xs={24}
                md={12}
              >
                <Text strong>
                  Clase
                </Text>

                <Select
                  size="large"
                  style={{
                    width:
                      '100%',

                    marginTop:
                      8,
                  }}
                  placeholder="Seleccione la clase"
                  value={
                    seccionId
                  }
                  disabled={
                    sesionActiva
                      ?.estado ===
                    'ABIERTA'
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
                    void seleccionarClase(
                      Number(
                        valor,
                      ),
                    );
                  }}
                />
              </Col>

              {/* CURSO */}

              <Col
                xs={24}
                md={12}
              >
                <Text strong>
                  Curso
                </Text>

                <Select
                  size="large"
                  style={{
                    width:
                      '100%',

                    marginTop:
                      8,
                  }}
                  placeholder="Seleccione el curso"
                  value={
                    asignacionId
                  }
                  disabled={
                    !seccionId ||
                    sesionActiva
                      ?.estado ===
                      'ABIERTA'
                  }
                  options={
                    cursosDeClase.map(
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
                  onChange={(
                    valor,
                  ) =>
                    seleccionarCurso(
                      Number(
                        valor,
                      ),
                    )
                  }
                />
              </Col>
            </Row>

            {/* INFORMACION CLASE */}

            {seccionId && (
              <div
                style={{
                  marginTop:
                    20,
                }}
              >
                {cargandoEstudiantes ? (
                  <Spin />
                ) : (
                  <Alert
                    type="info"
                    showIcon
                    message={
                      `${totalEstudiantes} estudiantes activos registrados en esta clase`
                    }
                    description="Los estudiantes que no sean escaneados antes de cerrar la sesion se registraran como AUSENTES."
                  />
                )}
              </div>
            )}

            {/* INICIAR */}

            {!sesionActiva &&
              asignacionSeleccionada && (
                <Button
                  type="primary"
                  size="large"
                  icon={
                    <CameraOutlined />
                  }
                  loading={
                    iniciando
                  }
                  disabled={
                    totalEstudiantes ===
                    0
                  }
                  onClick={
                    iniciarAsistencia
                  }
                  style={{
                    marginTop:
                      20,
                  }}
                >
                  Iniciar asistencia
                </Button>
              )}
          </>
        )}
      </Card>

      {/* ================================= */}
      {/* SESION ABIERTA */}
      {/* ================================= */}

      {sesionActiva
        ?.estado ===
        'ABIERTA' && (
        <>
          <Alert
            type="success"
            showIcon
            message="Asistencia en curso"
            description={
              asignacionSeleccionada
                ? `${obtenerNombreClase(asignacionSeleccionada)} | ${asignacionSeleccionada.curso}`
                : 'Sesion de asistencia abierta.'
            }
            style={{
              marginBottom:
                24,
            }}
          />

          {/* CONTADORES */}

          <Row
            gutter={[
              16,
              16,
            ]}
            style={{
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
                  title="Total"
                  value={
                    totalEstudiantes
                  }
                  prefix={
                    <UserOutlined />
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
                    presentes
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
                  title="Pendientes"
                  value={
                    pendientes
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
                  value={0}
                  prefix={
                    <CloseCircleOutlined />
                  }
                />
              </Card>
            </Col>
          </Row>

          {/* CAMARA */}

          <Row
            gutter={[
              24,
              24,
            ]}
          >
            <Col
              xs={24}
              lg={14}
            >
              <Card
                title={
                  <Space>
                    <CameraOutlined />

                    Camara QR
                  </Space>
                }
              >
                <Alert
                  type={
                    camaraLista
                      ? 'success'
                      : 'info'
                  }
                  showIcon
                  message={
                    camaraLista
                      ? 'Camara lista. Muestre el codigo QR frente al telefono.'
                      : 'Preparando camara...'
                  }
                  style={{
                    marginBottom:
                      16,
                  }}
                />

                {camaraError && (
                  <Alert
                    type="error"
                    showIcon
                    message="No fue posible abrir la camara"
                    description={
                      camaraError
                    }
                    style={{
                      marginBottom:
                        16,
                    }}
                  />
                )}

                <div
                  id="lector-qr-asistencia"
                  style={{
                    width:
                      '100%',

                    maxWidth:
                      600,

                    margin:
                      '0 auto',
                  }}
                />

                {camaraError && (
                  <Button
                    icon={
                      <ReloadOutlined />
                    }
                    onClick={() => {
                      void iniciarCamara();
                    }}
                    style={{
                      marginTop:
                        16,
                    }}
                  >
                    Intentar nuevamente
                  </Button>
                )}
              </Card>
            </Col>

            {/* INFORMACION */}

            <Col
              xs={24}
              lg={10}
            >
              <Card
                title="Control de asistencia"
              >
                {ultimoEstudiante ? (
                  <Alert
                    type="success"
                    showIcon
                    message="Ultimo estudiante registrado"
                    description={
                      ultimoEstudiante
                    }
                  />
                ) : (
                  <Alert
                    type="info"
                    showIcon
                    message="Esperando primer codigo QR"
                  />
                )}

                <Alert
                  type="warning"
                  showIcon
                  message="Importante"
                  description="Cuando cierre la asistencia, todos los estudiantes que permanezcan pendientes seran registrados como AUSENTES."
                  style={{
                    marginTop:
                      20,
                  }}
                />

                <Space
                  direction="vertical"
                  style={{
                    width:
                      '100%',

                    marginTop:
                      24,
                  }}
                >
                  <Popconfirm
                    title="Cerrar asistencia"
                    description={
                      `Hay ${pendientes} estudiantes pendientes. Al cerrar quedaran como AUSENTES. ¿Desea continuar?`
                    }
                    okText="Si, cerrar"
                    cancelText="No"
                    onConfirm={
                      cerrarAsistencia
                    }
                  >
                    <Button
                      type="primary"
                      danger
                      block
                      size="large"
                      icon={
                        <StopOutlined />
                      }
                      loading={
                        cerrando
                      }
                    >
                      Cerrar asistencia
                    </Button>
                  </Popconfirm>

                  <Popconfirm
                    title="Cancelar sesion"
                    description="La sesion se cancelara y no se generaran ausencias. ¿Desea continuar?"
                    okText="Si, cancelar"
                    cancelText="No"
                    onConfirm={
                      cancelarAsistencia
                    }
                  >
                    <Button
                      block
                    >
                      Cancelar sesion
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* LISTADO EN TIEMPO REAL */}

          <Card
            title="Estudiantes de la clase"
            style={{
              marginTop:
                24,
            }}
          >
            <Table
              rowKey="estudiante_id"
              columns={
                columnas
              }
              dataSource={
                filasEstudiantes
              }
              pagination={
                false
              }
              scroll={{
                x:
                  700,
              }}
            />
          </Card>
        </>
      )}

      {/* ================================= */}
      {/* SESION CERRADA */}
      {/* ================================= */}

      {sesionActiva
        ?.estado ===
        'CERRADA' && (
        <>
          <Alert
            type="success"
            showIcon
            message="Asistencia finalizada correctamente"
            description="Los estudiantes escaneados quedaron PRESENTES y los estudiantes no escaneados quedaron AUSENTES."
            style={{
              marginBottom:
                24,
            }}
          />

          <Row
            gutter={[
              16,
              16,
            ]}
          >
            <Col
              xs={12}
              md={4}
            >
              <Card>
                <Statistic
                  title="Total"
                  value={
                    totalEstudiantes
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
                    presentes
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
                    ausentes
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
                  title="Pendientes"
                  value={
                    pendientes
                  }
                />
              </Card>
            </Col>

            <Col
              xs={24}
              md={8}
            >
              <Card>
                <Statistic
                  title="Porcentaje de asistencia"
                  value={
                    totalEstudiantes >
                    0
                      ? (
                          presentes /
                          totalEstudiantes
                        ) *
                        100
                      : 0
                  }
                  precision={1}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>

          <Card
            title="Resultado final"
            style={{
              marginTop:
                24,
            }}
          >
            <Table
              rowKey="estudiante_id"
              columns={
                columnas
              }
              dataSource={
                filasEstudiantes
              }
              pagination={{
                pageSize:
                  10,
              }}
              scroll={{
                x:
                  700,
              }}
            />
          </Card>

          <Button
            type="primary"
            size="large"
            icon={
              <QrcodeOutlined />
            }
            onClick={
              tomarOtraAsistencia
            }
            style={{
              marginTop:
                20,
            }}
          >
            Tomar otra asistencia
          </Button>
        </>
      )}
    </div>
  );
}