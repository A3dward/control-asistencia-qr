import {
  ArrowLeftOutlined,
  CameraOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  StopOutlined,
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
  Table,
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
  // SINCRONIZAR SESION
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
  // NOMBRE DE CLASE
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
  // CLASES
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
  // CURSOS DE LA CLASE
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
  // ESTUDIANTES + ESTADO
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
  // SOLO AUSENTES
  // =====================================

  const estudiantesAusentes =
    useMemo(
      () =>
        filasEstudiantes.filter(
          (
            estudiante,
          ) =>
            estudiante.estado ===
            'AUSENTE',
        ),
      [
        filasEstudiantes,
      ],
    );

  // =====================================
  // PENDIENTES
  //
  // SOLO SE USA INTERNAMENTE PARA
  // CONFIRMAR EL CIERRE.
  // NO SE MUESTRA COMO ESTADISTICA.
  // =====================================

  const pendientes =
    useMemo(
      () =>
        filasEstudiantes.filter(
          (
            estudiante,
          ) =>
            estudiante.estado ===
            'PENDIENTE',
        ).length,
      [
        filasEstudiantes,
      ],
    );

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
  // CARGAR ESTUDIANTES
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
  // CARGAR ASISTENCIAS DE SESION
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
        // Puede encontrarse
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
      // EVITAR LECTURAS REPETIDAS
      // DEL MISMO QR
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
          `${nombre} registrado`,
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
            // Es normal que existan
            // intentos sin detectar QR.
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
            'No fue posible abrir la cámara. Verifique que el navegador tenga permiso para utilizarla.',
          ),
        );
      }
    };

  // =====================================
  // ABRIR CAMARA AL ABRIR SESION
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

        if (!scanner) {
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
      await detenerCamara();

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

        ultimoQrRef.current =
          {
            codigo:
              '',

            momento:
              0,
          };

        // =================================
        // VERIFICAR SESION ABIERTA
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

        if (abierta) {
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

          // Se cargan internamente los
          // registros para mantener
          // correctamente la sesion,
          // pero no se muestran como
          // listado en pantalla.

          await cargarAsistencias(
            existente.id,
          );

          message.info(
            'Ya existe una asistencia abierta para este curso. Se continuará con la misma.',
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

      if (!sesion) {
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

        // =================================
        // CARGAR RESULTADO FINAL
        // PARA CONOCER AUSENTES
        // =================================

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
  // CANCELAR ASISTENCIA
  // =====================================

  const cancelarAsistencia =
    async () => {
      const sesion =
        sesionActivaRef.current;

      if (!sesion) {
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

        ultimoQrRef.current =
          {
            codigo:
              '',

            momento:
              0,
          };

        message.success(
          'Sesión cancelada correctamente.',
        );
      } catch (
        error
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cancelar la sesión.',
          ),
        );
      }
    };

  // =====================================
  // TOMAR OTRA ASISTENCIA
  //
  // LIMPIAMOS ABSOLUTAMENTE TODO
  // LO RELACIONADO CON LA SESION
  // ANTERIOR.
  // =====================================

  const tomarOtraAsistencia =
    () => {
      setSeccionId(
        undefined,
      );

      setAsignacionId(
        undefined,
      );

      setSesionActiva(
        null,
      );

      setEstudiantes(
        [],
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

      setCamaraLista(
        false,
      );

      ultimoQrRef.current =
        {
          codigo:
            '',

          momento:
            0,
        };

      procesandoQrRef.current =
        false;

      window.scrollTo({
        top:
          0,

        behavior:
          'smooth',
      });
    };

  // =====================================
  // COLUMNAS DE AUSENTES
  // =====================================

  const columnasAusentes:
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
          180,
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
  // VISTA
  // =====================================

  return (
    <div
      style={{
        maxWidth:
          1100,

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
        type="text"
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
        className="boton-regresar"
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
          Tomar asistencia
        </Title>

        <Text
          type="secondary"
        >
          Seleccione la clase y el
          curso para iniciar el
          registro mediante código QR.
        </Text>
      </div>

      {/* ================================= */}
      {/* CONFIGURACION */}
      {/* ================================= */}

      <Card
        style={{
          marginBottom:
            22,
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
              align="bottom"
            >
              {/* CLASE */}

              <Col
                xs={24}
                md={10}
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
                md={10}
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

              {/* INICIAR */}

              <Col
                xs={24}
                md={4}
              >
                {!sesionActiva &&
                  asignacionSeleccionada && (
                    <Button
                      type="primary"
                      block
                      size="large"
                      icon={
                        <CameraOutlined />
                      }
                      loading={
                        iniciando
                      }
                      disabled={
                        cargandoEstudiantes ||
                        estudiantes.length ===
                          0
                      }
                      onClick={
                        iniciarAsistencia
                      }
                    >
                      Iniciar
                    </Button>
                  )}
              </Col>
            </Row>

            {/* SOLO MOSTRAR AVISO SI NO
                HAY ESTUDIANTES */}

            {seccionId &&
              !cargandoEstudiantes &&
              estudiantes.length ===
                0 && (
                <Alert
                  type="warning"
                  showIcon
                  message="Esta clase no tiene estudiantes activos registrados."
                  style={{
                    marginTop:
                      16,
                  }}
                />
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
                ? `${obtenerNombreClase(
                    asignacionSeleccionada,
                  )} · ${
                    asignacionSeleccionada.curso
                  }`
                : 'Sesión de asistencia abierta.'
            }
            style={{
              marginBottom:
                20,
            }}
          />

          <Row
            gutter={[
              20,
              20,
            ]}
          >
            {/* ========================= */}
            {/* CAMARA */}
            {/* ========================= */}

            <Col
              xs={24}
              lg={15}
            >
              <Card
                title={
                  <Space>
                    <CameraOutlined />

                    Cámara QR
                  </Space>
                }
              >
                {camaraLista && (
                  <Alert
                    type="success"
                    showIcon
                    message="Cámara lista. Muestre el código QR del estudiante."
                    style={{
                      marginBottom:
                        16,
                    }}
                  />
                )}

                {!camaraLista &&
                  !camaraError && (
                    <Alert
                      type="info"
                      showIcon
                      message="Preparando cámara..."
                      style={{
                        marginBottom:
                          16,
                      }}
                    />
                  )}

                {camaraError && (
                  <Alert
                    type="error"
                    showIcon
                    message="No fue posible abrir la cámara"
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

            {/* ========================= */}
            {/* CONTROLES */}
            {/* ========================= */}

            <Col
              xs={24}
              lg={9}
            >
              <Card
                title="Control de asistencia"
              >
                {ultimoEstudiante ? (
                  <Alert
                    type="success"
                    showIcon
                    message="Registrado correctamente"
                    description={
                      ultimoEstudiante
                    }
                  />
                ) : (
                  <Alert
                    type="info"
                    showIcon
                    message="Esperando código QR"
                  />
                )}

                <Space
                  direction="vertical"
                  size={12}
                  style={{
                    width:
                      '100%',

                    marginTop:
                      20,
                  }}
                >
                  <Popconfirm
                    title="Cerrar asistencia"
                    description={
                      pendientes >
                      0
                        ? `Los ${pendientes} estudiantes no escaneados quedarán como AUSENTES. ¿Desea cerrar la asistencia?`
                        : 'Todos los estudiantes fueron registrados. ¿Desea cerrar la asistencia?'
                    }
                    okText="Sí, cerrar"
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
                    title="Cancelar sesión"
                    description="La sesión será cancelada. ¿Desea continuar?"
                    okText="Sí, cancelar"
                    cancelText="No"
                    onConfirm={
                      cancelarAsistencia
                    }
                  >
                    <Button
                      block
                    >
                      Cancelar sesión
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            </Col>
          </Row>
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
            description={
              estudiantesAusentes.length >
              0
                ? 'A continuación se muestran únicamente los estudiantes que quedaron ausentes.'
                : 'Todos los estudiantes fueron registrados como presentes.'
            }
          />

          {/* ================================= */}
          {/* SOLO AUSENTES */}
          {/* ================================= */}

          {estudiantesAusentes.length >
          0 ? (
            <Card
              title="Estudiantes ausentes"
              style={{
                marginTop:
                  20,
              }}
            >
              <Table
                rowKey="estudiante_id"
                columns={
                  columnasAusentes
                }
                dataSource={
                  estudiantesAusentes
                }
                pagination={
                  estudiantesAusentes.length >
                  10
                    ? {
                        pageSize:
                          10,
                      }
                    : false
                }
                scroll={{
                  x:
                    500,
                }}
              />
            </Card>
          ) : (
            <Alert
              type="success"
              showIcon
              message="No hubo estudiantes ausentes."
              style={{
                marginTop:
                  20,
              }}
            />
          )}

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