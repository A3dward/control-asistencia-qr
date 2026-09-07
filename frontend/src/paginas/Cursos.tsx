import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';

import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
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

interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
  fecha_creacion?: string;
}

interface FormularioCurso {
  codigo: string;
  nombre: string;
}

export default function Cursos() {
  const navigate =
    useNavigate();

  const [
    cursos,
    setCursos,
  ] =
    useState<Curso[]>([]);

  const [
    cargando,
    setCargando,
  ] =
    useState(false);

  const [
    modalAbierto,
    setModalAbierto,
  ] =
    useState(false);

  const [
    cursoEditando,
    setCursoEditando,
  ] =
    useState<Curso | null>(
      null,
    );

  const [
    guardando,
    setGuardando,
  ] =
    useState(false);

  const [
    form,
  ] =
    Form.useForm<FormularioCurso>();

  // =====================================
  // OBTENER CURSOS
  // =====================================

  const obtenerCursos =
    async () => {
      setCargando(true);

      try {
        const respuesta =
          await api.get(
            '/cursos',
          );

        const datos =
          respuesta.data.datos ??
          [];

        const normalizados =
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
          );

        setCursos(
          normalizados,
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
              'No fue posible obtener los cursos.',
          );
        } else {
          message.error(
            'Ocurrio un error al obtener los cursos.',
          );
        }
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerCursos();
  }, []);

  // =====================================
  // NUEVO CURSO
  // =====================================

  const abrirNuevo = () => {
    setCursoEditando(
      null,
    );

    form.resetFields();

    setModalAbierto(
      true,
    );
  };

  // =====================================
  // EDITAR CURSO
  // =====================================

  const abrirEditar = (
    curso: Curso,
  ) => {
    setCursoEditando(
      curso,
    );

    form.setFieldsValue({
      codigo:
        curso.codigo,

      nombre:
        curso.nombre,
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

    setCursoEditando(
      null,
    );

    form.resetFields();
  };

  // =====================================
  // GUARDAR
  // =====================================

  const guardarCurso =
    async (
      valores:
        FormularioCurso,
    ) => {
      setGuardando(true);

      try {
        if (
          cursoEditando
        ) {
          await api.patch(
            `/cursos/${cursoEditando.id}`,
            {
              codigo:
                valores.codigo,

              nombre:
                valores.nombre,
            },
          );

          message.success(
            'Curso actualizado correctamente.',
          );
        } else {
          await api.post(
            '/cursos',
            {
              codigo:
                valores.codigo,

              nombre:
                valores.nombre,
            },
          );

          message.success(
            'Curso registrado correctamente.',
          );
        }

        cerrarModal();

        await obtenerCursos();
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
                'No fue posible guardar el curso.',
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
      curso: Curso,
    ) => {
      try {
        const ruta =
          curso.activo
            ? `/cursos/${curso.id}/desactivar`
            : `/cursos/${curso.id}/activar`;

        await api.patch(
          ruta,
        );

        message.success(
          curso.activo
            ? 'Curso desactivado correctamente.'
            : 'Curso activado correctamente.',
        );

        await obtenerCursos();
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
              'No fue posible cambiar el estado del curso.',
          );
        } else {
          message.error(
            'Ocurrio un error inesperado.',
          );
        }
      }
    };

  // =====================================
  // COLUMNAS
  // =====================================

  const columnas:
    TableColumnsType<Curso> =
    [
      {
        title:
          'Codigo',

        dataIndex:
          'codigo',

        key:
          'codigo',

        width:
          160,
      },

      {
        title:
          'Nombre',

        dataIndex:
          'nombre',

        key:
          'nombre',
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
          activo: boolean,
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
          250,

        render: (
          _,
          curso,
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
                  curso,
                )
              }
            >
              Editar
            </Button>

            <Popconfirm
              title={
                curso.activo
                  ? 'Desactivar curso'
                  : 'Activar curso'
              }
              description={
                curso.activo
                  ? '¿Desea desactivar este curso?'
                  : '¿Desea activar este curso?'
              }
              okText="Si"
              cancelText="No"
              onConfirm={() =>
                cambiarEstado(
                  curso,
                )
              }
            >
              <Button
                danger={
                  curso.activo
                }
                type={
                  curso.activo
                    ? 'default'
                    : 'primary'
                }
                icon={
                  <PoweroffOutlined />
                }
              >
                {curso.activo
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
            Cursos
          </Title>

          <Text
            type="secondary"
          >
            Administracion del catalogo
            general de cursos.
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
          Nuevo curso
        </Button>
      </div>

      <Card>
        <Table
          rowKey="id"
          columns={
            columnas
          }
          dataSource={
            cursos
          }
          loading={
            cargando
          }
          scroll={{
            x: 750,
          }}
          pagination={{
            pageSize:
              10,

            showSizeChanger:
              true,

            showTotal: (
              total,
            ) =>
              `Total: ${total} cursos`,
          }}
        />
      </Card>

      <Modal
        title={
          cursoEditando
            ? 'Editar curso'
            : 'Nuevo curso'
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
            guardarCurso
          }
        >
          <Form.Item
            label="Codigo"
            name="codigo"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese el codigo del curso.',
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
              placeholder="MAT-01"
            />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese el nombre del curso.',
              },

              {
                max:
                  120,

                message:
                  'Maximo 120 caracteres.',
              },
            ]}
          >
            <Input
              placeholder="Matematica"
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
              {cursoEditando
                ? 'Guardar cambios'
                : 'Registrar curso'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}