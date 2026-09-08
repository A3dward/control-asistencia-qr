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

  const cargarDatos =
    async () => {
      try {
        setCargando(
          true,
        );

        const [
          respuestaCursos,
          respuestaClases,
          respuestaRelaciones,
        ] =
          await Promise.all([
            api.get(
              '/cursos',
            ),

            api.get(
              '/secciones',
            ),

            api.get(
              '/gestion-clases/configuracion-cursos',
            ),
          ]);

        setCursos(
          respuestaCursos
            .data
            .datos ?? [],
        );

        setClases(
          respuestaClases
            .data
            .datos ?? [],
        );

        setRelaciones(
          respuestaRelaciones
            .data
            .datos ?? [],
        );
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar la configuracion.',
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

  // Los cursos activos que ya pertenecen
  // a otra clase no aparecen nuevamente.

  const cursosDisponibles =
    useMemo(
      () => {
        const asignados =
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
            !asignados.has(
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
          message="Seleccione un curso y la clase a la que pertenece."
          description="Cuando posteriormente asigne esta clase a un docente, recibira automaticamente todos estos cursos."
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
                  placeholder="Ejemplo: Tercero Basico A - 2026"
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
                  options={
                    cursosDisponibles.map(
                      (
                        curso,
                      ) => ({
                        value:
                          curso.id,

                        label:
                          curso.nombre,
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
          pagination={{
            pageSize:
              10,
          }}
        />
      </Card>
    </div>
  );
}