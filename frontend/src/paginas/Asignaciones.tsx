import {
  ArrowLeftOutlined,
  PlusOutlined,
  PoweroffOutlined,
  SolutionOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Form,
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
  id: number;
  codigo_docente: string;
  nombre_completo: string;
  correo: string;
  activo: boolean;
}

interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

interface Seccion {
  id: number;
  nombre: string;
  grado: string;
  anio_academico: number;
  activo: boolean;
}

interface Asignacion {
  id: number;

  docente_id: number;
  curso_id: number;
  seccion_id: number;

  codigo_docente: string;
  docente: string;

  codigo_curso: string;
  curso: string;

  seccion: string;
  grado: string;
  anio_academico: number;

  activo: boolean;
}

interface FormularioAsignacion {
  docente_id: number;
  curso_id: number;
  seccion_id: number;
}

// =====================================
// COMPONENTE
// =====================================

export default function Asignaciones() {
  const navigate =
    useNavigate();

  const [
    asignaciones,
    setAsignaciones,
  ] =
    useState<Asignacion[]>([]);

  const [
    docentes,
    setDocentes,
  ] =
    useState<Docente[]>([]);

  const [
    cursos,
    setCursos,
  ] =
    useState<Curso[]>([]);

  const [
    secciones,
    setSecciones,
  ] =
    useState<Seccion[]>([]);

  const [
    cargando,
    setCargando,
  ] =
    useState(false);

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
    form,
  ] =
    Form.useForm<FormularioAsignacion>();

  // =====================================
  // OBTENER ASIGNACIONES
  // =====================================

  const obtenerAsignaciones =
    async () => {
      setCargando(true);

      try {
        const respuesta =
          await api.get(
            '/asignaciones',
          );

        const datos =
          respuesta.data.datos ??
          [];

        const normalizadas:
          Asignacion[] =
          datos.map(
            (
              asignacion: any,
            ) => ({
              id:
                Number(
                  asignacion.id,
                ),

              docente_id:
                Number(
                  asignacion.docente_id,
                ),

              curso_id:
                Number(
                  asignacion.curso_id,
                ),

              seccion_id:
                Number(
                  asignacion.seccion_id,
                ),

              codigo_docente:
                asignacion.codigo_docente ??
                '',

              docente:
                asignacion.docente ??
                asignacion.nombre_docente ??
                asignacion.nombre_completo ??
                '',

              codigo_curso:
                asignacion.codigo_curso ??
                asignacion.codigo ??
                '',

              curso:
                asignacion.curso ??
                asignacion.nombre_curso ??
                '',

              seccion:
                asignacion.seccion ??
                asignacion.nombre_seccion ??
                '',

              grado:
                asignacion.grado ??
                '',

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
      } catch (error) {
        if (
          axios.isAxiosError(
            error,
          )
        ) {
          message.error(
            error.response
              ?.data
              ?.message ??
              'No fue posible obtener las asignaciones.',
          );
        } else {
          message.error(
            'Ocurrio un error al obtener las asignaciones.',
          );
        }
      } finally {
        setCargando(false);
      }
    };

  // =====================================
  // OBTENER DOCENTES
  // =====================================

  const obtenerDocentes =
    async () => {
      try {
        const respuesta =
          await api.get(
            '/docentes',
          );

        const datos =
          respuesta.data.datos ??
          [];

        setDocentes(
          datos.map(
            (
              docente: any,
            ) => ({
              ...docente,

              id:
                Number(
                  docente.id,
                ),

              activo:
                Boolean(
                  docente.activo,
                ),
            }),
          ),
        );
      } catch {
        message.error(
          'No fue posible cargar los docentes.',
        );
      }
    };

  // =====================================
  // OBTENER CURSOS
  // =====================================

  const obtenerCursos =
    async () => {
      try {
        const respuesta =
          await api.get(
            '/cursos',
          );

        const datos =
          respuesta.data.datos ??
          [];

        setCursos(
          datos.map(
            (
              curso: any,
            ) => ({
              ...curso,

              id:
                Number(
                  curso.id,
                ),

              activo:
                Boolean(
                  curso.activo,
                ),
            }),
          ),
        );
      } catch {
        message.error(
          'No fue posible cargar los cursos.',
        );
      }
    };

  // =====================================
  // OBTENER SECCIONES
  // =====================================

  const obtenerSecciones =
    async () => {
      try {
        const respuesta =
          await api.get(
            '/secciones',
          );

        const datos =
          respuesta.data.datos ??
          [];

        setSecciones(
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
          ),
        );
      } catch {
        message.error(
          'No fue posible cargar las secciones.',
        );
      }
    };

  useEffect(() => {
    obtenerAsignaciones();
    obtenerDocentes();
    obtenerCursos();
    obtenerSecciones();
  }, []);

  // =====================================
  // ABRIR MODAL
  // =====================================

  const abrirNueva = () => {
    form.resetFields();

    setModalAbierto(
      true,
    );
  };

  const cerrarModal = () => {
    setModalAbierto(
      false,
    );

    form.resetFields();
  };

  // =====================================
  // GUARDAR ASIGNACION
  // =====================================

  const guardarAsignacion =
    async (
      valores:
        FormularioAsignacion,
    ) => {
      setGuardando(true);

      try {
        await api.post(
          '/asignaciones',
          {
            docente_id:
              valores.docente_id,

            curso_id:
              valores.curso_id,

            seccion_id:
              valores.seccion_id,
          },
        );

        message.success(
          'Asignacion creada correctamente.',
        );

        cerrarModal();

        await obtenerAsignaciones();
      } catch (error) {
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
            message.error(
              respuesta.join(
                ', ',
              ),
            );
          } else {
            message.error(
              respuesta ??
                'No fue posible crear la asignacion.',
            );
          }
        } else {
          message.error(
            'Ocurrio un error inesperado.',
          );
        }
      } finally {
        setGuardando(false);
      }
    };

  // =====================================
  // CAMBIAR ESTADO
  // =====================================

  const cambiarEstado =
    async (
      asignacion:
        Asignacion,
    ) => {
      try {
        const ruta =
          asignacion.activo
            ? `/asignaciones/${asignacion.id}/desactivar`
            : `/asignaciones/${asignacion.id}/activar`;

        await api.patch(
          ruta,
        );

        message.success(
          asignacion.activo
            ? 'Asignacion desactivada correctamente.'
            : 'Asignacion activada correctamente.',
        );

        await obtenerAsignaciones();
      } catch (error) {
        if (
          axios.isAxiosError(
            error,
          )
        ) {
          message.error(
            error.response
              ?.data
              ?.message ??
              'No fue posible cambiar el estado.',
          );
        } else {
          message.error(
            'Ocurrio un error inesperado.',
          );
        }
      }
    };

  // =====================================
  // OPCIONES SELECT
  // =====================================

  const opcionesDocentes =
    docentes
      .filter(
        (
          docente,
        ) =>
          docente.activo,
      )
      .map(
        (
          docente,
        ) => ({
          value:
            docente.id,

          label:
            `${docente.codigo_docente} - ${docente.nombre_completo}`,
        }),
      );

  const opcionesCursos =
    cursos
      .filter(
        (
          curso,
        ) =>
          curso.activo,
      )
      .map(
        (
          curso,
        ) => ({
          value:
            curso.id,

          label:
            `${curso.codigo} - ${curso.nombre}`,
        }),
      );

  const opcionesSecciones =
    secciones
      .filter(
        (
          seccion,
        ) =>
          seccion.activo,
      )
      .map(
        (
          seccion,
        ) => ({
          value:
            seccion.id,

          label:
            `${seccion.grado} - ${seccion.nombre} - ${seccion.anio_academico}`,
        }),
      );

  // =====================================
  // COLUMNAS
  // =====================================

  const columnas:
    TableColumnsType<Asignacion> =
    [
      {
        title:
          'Docente',

        key:
          'docente',

        render: (
          _,
          asignacion,
        ) => (
          <div>
            <div>
              <strong>
                {
                  asignacion.docente
                }
              </strong>
            </div>

            <Text
              type="secondary"
            >
              {
                asignacion.codigo_docente
              }
            </Text>
          </div>
        ),
      },

      {
        title:
          'Curso',

        key:
          'curso',

        render: (
          _,
          asignacion,
        ) => (
          <div>
            <div>
              {
                asignacion.curso
              }
            </div>

            <Text
              type="secondary"
            >
              {
                asignacion.codigo_curso
              }
            </Text>
          </div>
        ),
      },

      {
        title:
          'Grado',

        dataIndex:
          'grado',

        key:
          'grado',
      },

      {
        title:
          'Seccion',

        dataIndex:
          'seccion',

        key:
          'seccion',
      },

      {
        title:
          'Año',

        dataIndex:
          'anio_academico',

        key:
          'anio_academico',

        width:
          100,
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
              ? 'ACTIVA'
              : 'INACTIVA'}
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
          asignacion,
        ) => (
          <Space>
            <Popconfirm
              title={
                asignacion.activo
                  ? 'Desactivar asignacion'
                  : 'Activar asignacion'
              }
              description={
                asignacion.activo
                  ? 'El docente dejara de poder iniciar nuevas clases con esta asignacion. ¿Continuar?'
                  : '¿Desea activar nuevamente esta asignacion?'
              }
              okText="Si"
              cancelText="No"
              onConfirm={() =>
                cambiarEstado(
                  asignacion,
                )
              }
            >
              <Button
                danger={
                  asignacion.activo
                }
                type={
                  asignacion.activo
                    ? 'default'
                    : 'primary'
                }
                icon={
                  <PoweroffOutlined />
                }
              >
                {asignacion.activo
                  ? 'Desactivar'
                  : 'Activar'}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

  return (
    <div className="pagina-administracion">
      {/* ENCABEZADO */}

      <div className="pagina-encabezado">
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
            Asignaciones docentes
          </Title>

          <Text
            type="secondary"
          >
            Asignacion de docentes,
            cursos y secciones.
          </Text>
        </div>

        <Button
          type="primary"
          icon={
            <PlusOutlined />
          }
          size="large"
          onClick={
            abrirNueva
          }
        >
          Nueva asignacion
        </Button>
      </div>

      <Alert
        type="info"
        showIcon
        icon={
          <SolutionOutlined />
        }
        message="Asignaciones academicas"
        description="Una asignacion determina que docente imparte un curso en una seccion especifica."
        style={{
          marginBottom:
            20,
        }}
      />

      {/* TABLA */}

      <Card>
        <Table
          rowKey="id"
          columns={
            columnas
          }
          dataSource={
            asignaciones
          }
          loading={
            cargando
          }
          scroll={{
            x:
              1050,
          }}
          pagination={{
            pageSize:
              10,

            showSizeChanger:
              true,

            showTotal: (
              total,
            ) =>
              `Total: ${total} asignaciones`,
          }}
        />
      </Card>

      {/* MODAL */}

      <Modal
        title="Nueva asignacion docente"
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
            guardarAsignacion
          }
        >
          <Form.Item
            label="Docente"
            name="docente_id"
            rules={[
              {
                required:
                  true,

                message:
                  'Seleccione un docente.',
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Seleccione un docente"
              options={
                opcionesDocentes
              }
              optionFilterProp="label"
              notFoundContent="No hay docentes activos"
            />
          </Form.Item>

          <Form.Item
            label="Curso"
            name="curso_id"
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
              showSearch
              placeholder="Seleccione un curso"
              options={
                opcionesCursos
              }
              optionFilterProp="label"
              notFoundContent="No hay cursos activos"
            />
          </Form.Item>

          <Form.Item
            label="Seccion"
            name="seccion_id"
            rules={[
              {
                required:
                  true,

                message:
                  'Seleccione una seccion.',
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Seleccione una seccion"
              options={
                opcionesSecciones
              }
              optionFilterProp="label"
              notFoundContent="No hay secciones activas"
            />
          </Form.Item>

          <div className="modal-acciones">
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
              Crear asignacion
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}