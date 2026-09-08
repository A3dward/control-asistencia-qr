import {
  ArrowLeftOutlined,
  BookOutlined,
  PoweroffOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';

import type {
  TableColumnsType,
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

interface Curso {
  id: number;

  codigo: string;

  nombre: string;

  activo: boolean;
}

interface Clase {
  id: number;

  nombre: string;

  grado: string;

  anio_academico: number;

  activo: boolean;
}

interface CursoClase {
  id: number;

  curso_id: number;

  seccion_id: number;

  activo: boolean;

  codigo_curso: string;

  curso: string;

  curso_activo: boolean;

  seccion: string;

  grado: string;

  anio_academico: number;

  clase_activa: boolean;
}

interface Formulario {
  curso_id: number;

  seccion_id: number;
}

// =====================================
// COMPONENTE
// =====================================

export default function CursosClases() {
  const navigate =
    useNavigate();

  const [
    form,
  ] =
    Form.useForm<Formulario>();

  const [
    cursos,
    setCursos,
  ] =
    useState<Curso[]>([]);

  const [
    clases,
    setClases,
  ] =
    useState<Clase[]>([]);

  const [
    relaciones,
    setRelaciones,
  ] =
    useState<CursoClase[]>([]);

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

  const nombreClase = (
    clase: {
      grado: string;

      nombre?: string;

      seccion?: string;

      anio_academico: number;
    },
  ) => {
    const seccion =
      clase.nombre ??
      clase.seccion ??
      '';

    const mostrarSeccion =
      seccion &&
      seccion
        .toLowerCase() !==
        'general';

    return mostrarSeccion
      ? `${clase.grado} - Seccion ${seccion} - ${clase.anio_academico}`
      : `${clase.grado} - ${clase.anio_academico}`;
  };

  // =====================================
  // CARGAR CURSOS
  // =====================================

  const cargarCursos =
    async () => {
      try {
        const respuesta =
          await api.get(
            '/cursos',
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const normalizados:
          Curso[] =
          datos.map(
            (
              curso: any,
            ) => ({
              id:
                Number(
                  curso.id,
                ),

              codigo:
                curso.codigo,

              nombre:
                curso.nombre,

              activo:
                Boolean(
                  curso.activo,
                ),
            }),
          );

        setCursos(
          normalizados,
        );
      } catch (
        error: any
      ) {
        console.error(
          'Error cursos:',
          error,
        );

        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar los cursos.',
          ),
        );
      }
    };

  // =====================================
  // CARGAR CLASES
  // =====================================

  const cargarClases =
    async () => {
      try {
        const respuesta =
          await api.get(
            '/secciones',
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const normalizadas:
          Clase[] =
          datos.map(
            (
              clase: any,
            ) => ({
              id:
                Number(
                  clase.id,
                ),

              nombre:
                clase.nombre,

              grado:
                clase.grado,

              anio_academico:
                Number(
                  clase.anio_academico,
                ),

              activo:
                Boolean(
                  clase.activo,
                ),
            }),
          );

        setClases(
          normalizadas,
        );
      } catch (
        error: any
      ) {
        console.error(
          'Error clases:',
          error,
        );

        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar las clases.',
          ),
        );
      }
    };

  // =====================================
  // CARGAR CURSOS ASIGNADOS A CLASES
  // =====================================

  const cargarRelaciones =
    async () => {
      try {
        const respuesta =
          await api.get(
            '/gestion-clases/configuracion-cursos',
          );

        const datos =
          respuesta.data
            .datos ?? [];

        const normalizadas:
          CursoClase[] =
          datos.map(
            (
              relacion: any,
            ) => ({
              id:
                Number(
                  relacion.id,
                ),

              curso_id:
                Number(
                  relacion.curso_id,
                ),

              seccion_id:
                Number(
                  relacion.seccion_id,
                ),

              activo:
                Boolean(
                  relacion.activo,
                ),

              codigo_curso:
                relacion.codigo_curso,

              curso:
                relacion.curso,

              curso_activo:
                Boolean(
                  relacion.curso_activo,
                ),

              seccion:
                relacion.seccion,

              grado:
                relacion.grado,

              anio_academico:
                Number(
                  relacion.anio_academico,
                ),

              clase_activa:
                Boolean(
                  relacion.clase_activa,
                ),
            }),
          );

        setRelaciones(
          normalizadas,
        );
      } catch (
        error: any
      ) {
        console.error(
          'Error relaciones:',
          error,
        );

        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar los cursos asignados a las clases.',
          ),
        );
      }
    };

  // =====================================
  // CARGAR TODO
  // =====================================

  const cargarDatos =
    async () => {
      setCargando(
        true,
      );

      await Promise.allSettled([
        cargarCursos(),
        cargarClases(),
        cargarRelaciones(),
      ]);

      setCargando(
        false,
      );
    };

  useEffect(
    () => {
      cargarDatos();
    },
    [],
  );

  // =====================================
  // CURSOS DISPONIBLES
  // =====================================

  const cursosDisponibles =
    useMemo(
      () => {
        const cursosAsignados =
          new Set(
            relaciones
              .filter(
                (
                  relacion,
                ) =>
                  Boolean(
                    relacion.activo,
                  ),
              )
              .map(
                (
                  relacion,
                ) =>
                  Number(
                    relacion.curso_id,
                  ),
              ),
          );

        return cursos.filter(
          (
            curso,
          ) =>
            Boolean(
              curso.activo,
            ) &&
            !cursosAsignados.has(
              Number(
                curso.id,
              ),
            ),
        );
      },
      [
        cursos,
        relaciones,
      ],
    );

  // =====================================
  // ASIGNAR CURSO
  // =====================================

  const asignarCurso =
    async (
      valores:
        Formulario,
    ) => {
      try {
        setGuardando(
          true,
        );

        await api.post(
          '/gestion-clases/cursos-clases',
          {
            curso_id:
              Number(
                valores.curso_id,
              ),

            seccion_id:
              Number(
                valores.seccion_id,
              ),
          },
        );

        message.success(
          'Curso asignado a la clase correctamente.',
        );

        form.resetFields();

        await cargarDatos();
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible asignar el curso.',
          ),
        );
      } finally {
        setGuardando(
          false,
        );
      }
    };

  // =====================================
  // ACTIVAR / DESACTIVAR
  // =====================================

  const cambiarEstado =
    async (
      relacion:
        CursoClase,
    ) => {
      try {
        const accion =
          relacion.activo
            ? 'desactivar'
            : 'activar';

        await api.patch(
          `/gestion-clases/cursos-clases/${relacion.id}/${accion}`,
        );

        message.success(
          relacion.activo
            ? 'Curso quitado de la clase.'
            : 'Curso reactivado en la clase.',
        );

        await cargarDatos();
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cambiar la asignacion.',
          ),
        );
      }
    };

  // =====================================
  // COLUMNAS
  // =====================================

  const columnas:
    TableColumnsType<CursoClase> =
    [
      {
        title:
          'Clase',

        key:
          'clase',

        render: (
          _,
          relacion,
        ) =>
          nombreClase({
            grado:
              relacion.grado,

            seccion:
              relacion.seccion,

            anio_academico:
              relacion.anio_academico,
          }),
      },

      {
        title:
          'Curso',

        key:
          'curso',

        render: (
          _,
          relacion,
        ) => (
          <div>
            <strong>
              {
                relacion.curso
              }
            </strong>

            <br />

            <Text
              type="secondary"
            >
              {
                relacion.codigo_curso
              }
            </Text>
          </div>
        ),
      },

      {
        title:
          'Estado',

        key:
          'estado',

        render: (
          _,
          relacion,
        ) => (
          <Tag
            color={
              relacion.activo
                ? 'green'
                : 'red'
            }
          >
            {relacion.activo
              ? 'ASIGNADO'
              : 'DESASIGNADO'}
          </Tag>
        ),
      },

      {
        title:
          'Acciones',

        key:
          'acciones',

        width:
          170,

        render: (
          _,
          relacion,
        ) => (
          <Popconfirm
            title={
              relacion.activo
                ? 'Quitar curso'
                : 'Reactivar curso'
            }
            description={
              relacion.activo
                ? 'El curso dejara de formar parte de esta clase. ¿Continuar?'
                : '¿Desea volver a agregar este curso a la clase?'
            }
            okText="Si"
            cancelText="No"
            onConfirm={() =>
              cambiarEstado(
                relacion,
              )
            }
          >
            <Button
              danger={
                relacion.activo
              }
              type={
                relacion.activo
                  ? 'default'
                  : 'primary'
              }
              icon={
                <PoweroffOutlined />
              }
            >
              {relacion.activo
                ? 'Quitar'
                : 'Reactivar'}
            </Button>
          </Popconfirm>
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

          <Title level={2}>
            Cursos por clase
          </Title>

          <Text
            type="secondary"
          >
            Defina los cursos que
            pertenecen a cada clase.
          </Text>
        </div>

        <Button
          icon={
            <ReloadOutlined />
          }
          onClick={
            cargarDatos
          }
        >
          Actualizar
        </Button>
      </div>

      <Card
        title={
          <Space>
            <BookOutlined />

            Asignar curso a una clase
          </Space>
        }
        style={{
          marginBottom:
            24,
        }}
      >
        <Alert
          type="info"
          showIcon
          message="Seleccione una clase y uno de los cursos disponibles."
          description="Posteriormente, cuando la clase sea asignada a un docente, recibira automaticamente todos sus cursos."
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
            asignarCurso
          }
        >
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
                name="seccion_id"
                label="Clase"
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Seleccione una clase.',
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Seleccione la clase"
                  showSearch
                  optionFilterProp="label"
                  options={
                    clases
                      .filter(
                        (
                          clase,
                        ) =>
                          Boolean(
                            clase.activo,
                          ),
                      )
                      .map(
                        (
                          clase,
                        ) => ({
                          value:
                            clase.id,

                          label:
                            nombreClase(
                              clase,
                            ),
                        }),
                      )
                  }
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="curso_id"
                label="Curso"
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Seleccione un curso.',
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Seleccione el curso"
                  showSearch
                  optionFilterProp="label"
                  options={
                    cursosDisponibles.map(
                      (
                        curso,
                      ) => ({
                        value:
                          curso.id,

                        label:
                          `${curso.codigo} - ${curso.nombre}`,
                      }),
                    )
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            loading={
              guardando
            }
          >
            Asignar curso a clase
          </Button>
        </Form>
      </Card>

      <Card
        title="Cursos asignados a las clases"
      >
        <Table
          rowKey="id"
          loading={
            cargando
          }
          columns={
            columnas
          }
          dataSource={
            relaciones
          }
          locale={{
            emptyText:
              'Todavia no hay cursos asignados a clases.',
          }}
          pagination={{
            pageSize:
              10,
          }}
        />
      </Card>
    </div>
  );
}