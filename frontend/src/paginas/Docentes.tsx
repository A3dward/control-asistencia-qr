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

// =====================================
// INTERFACES
// =====================================

interface Docente {
  id: number;

  codigo_docente: string;

  usuario_id: number;

  nombre_completo: string;

  correo: string;

  rol: string;

  activo: boolean;

  usuario_activo?: boolean;

  fecha_creacion?: string;
}

interface FormularioDocente {
  nombre_completo: string;

  correo: string;

  codigo_docente: string;

  contrasena?: string;
}

// =====================================
// COMPONENTE
// =====================================

export default function Docentes() {
  const navigate =
    useNavigate();

  const [
    docentes,
    setDocentes,
  ] =
    useState<Docente[]>([]);

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
    docenteEditando,
    setDocenteEditando,
  ] =
    useState<Docente | null>(
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
    Form.useForm<FormularioDocente>();

  // =====================================
  // OBTENER DOCENTES
  // =====================================

  const obtenerDocentes =
    async () => {
      setCargando(true);

      try {
        const respuesta =
          await api.get(
            '/docentes',
          );

        const datos =
          respuesta.data.datos ??
          [];

        const normalizados =
          datos.map(
            (
              docente: any,
            ) => ({
              ...docente,

              id:
                Number(
                  docente.id,
                ),

              usuario_id:
                Number(
                  docente.usuario_id,
                ),

              activo:
                Boolean(
                  docente.activo,
                ),

              usuario_activo:
                docente.usuario_activo !==
                undefined
                  ? Boolean(
                      docente.usuario_activo,
                    )
                  : undefined,
            }),
          );

        setDocentes(
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
              'No fue posible obtener los docentes.',
          );
        } else {
          message.error(
            'Ocurrio un error al obtener los docentes.',
          );
        }
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerDocentes();
  }, []);

  // =====================================
  // NUEVO DOCENTE
  // =====================================

  const abrirNuevo = () => {
    setDocenteEditando(
      null,
    );

    form.resetFields();

    setModalAbierto(
      true,
    );
  };

  // =====================================
  // EDITAR DOCENTE
  // =====================================

  const abrirEditar = (
    docente: Docente,
  ) => {
    setDocenteEditando(
      docente,
    );

    form.setFieldsValue({
      nombre_completo:
        docente.nombre_completo,

      correo:
        docente.correo,

      codigo_docente:
        docente.codigo_docente,

      contrasena:
        undefined,
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

    setDocenteEditando(
      null,
    );

    form.resetFields();
  };

  // =====================================
  // GUARDAR DOCENTE
  // =====================================

  const guardarDocente =
    async (
      valores:
        FormularioDocente,
    ) => {
      setGuardando(true);

      try {
        if (
          docenteEditando
        ) {
          await api.patch(
            `/docentes/${docenteEditando.id}`,
            {
              nombre_completo:
                valores.nombre_completo,

              correo:
                valores.correo,

              codigo_docente:
                valores.codigo_docente,
            },
          );

          message.success(
            'Docente actualizado correctamente.',
          );
        } else {
          await api.post(
            '/docentes',
            {
              nombre_completo:
                valores.nombre_completo,

              correo:
                valores.correo,

              contrasena:
                valores.contrasena,

              codigo_docente:
                valores.codigo_docente,
            },
          );

          message.success(
            'Docente registrado correctamente.',
          );
        }

        cerrarModal();

        await obtenerDocentes();
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
                'No fue posible guardar el docente.',
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
      docente: Docente,
    ) => {
      try {
        const ruta =
          docente.activo
            ? `/docentes/${docente.id}/desactivar`
            : `/docentes/${docente.id}/activar`;

        await api.patch(
          ruta,
        );

        message.success(
          docente.activo
            ? 'Docente desactivado correctamente.'
            : 'Docente activado correctamente.',
        );

        await obtenerDocentes();
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
              'No fue posible cambiar el estado del docente.',
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
    TableColumnsType<Docente> =
    [
      {
        title:
          'Codigo',

        dataIndex:
          'codigo_docente',

        key:
          'codigo_docente',

        width:
          140,
      },

      {
        title:
          'Nombre',

        dataIndex:
          'nombre_completo',

        key:
          'nombre_completo',
      },

      {
        title:
          'Correo',

        dataIndex:
          'correo',

        key:
          'correo',
      },

      {
        title:
          'Rol',

        dataIndex:
          'rol',

        key:
          'rol',

        width:
          110,

        render: (
          rol: string,
        ) => (
          <Tag color="blue">
            {rol}
          </Tag>
        ),
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
          docente,
        ) => (
          <Space wrap>
            <Button
              icon={
                <EditOutlined />
              }
              onClick={() =>
                abrirEditar(
                  docente,
                )
              }
            >
              Editar
            </Button>

            <Popconfirm
              title={
                docente.activo
                  ? 'Desactivar docente'
                  : 'Activar docente'
              }
              description={
                docente.activo
                  ? 'El docente ya no podra iniciar sesion. ¿Continuar?'
                  : '¿Desea activar nuevamente este docente?'
              }
              okText="Si"
              cancelText="No"
              onConfirm={() =>
                cambiarEstado(
                  docente,
                )
              }
            >
              <Button
                danger={
                  docente.activo
                }
                type={
                  docente.activo
                    ? 'default'
                    : 'primary'
                }
                icon={
                  <PoweroffOutlined />
                }
              >
                {docente.activo
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
      {/* =====================================
          ENCABEZADO
      ====================================== */}

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
            Docentes
          </Title>

          <Text
            type="secondary"
          >
            Registro y administracion
            de docentes con acceso
            al sistema.
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
          Nuevo docente
        </Button>
      </div>

      {/* =====================================
          TABLA
      ====================================== */}

      <Card>
        <Table
          rowKey="id"
          columns={
            columnas
          }
          dataSource={
            docentes
          }
          loading={
            cargando
          }
          scroll={{
            x: 1000,
          }}
          pagination={{
            pageSize:
              10,

            showSizeChanger:
              true,

            showTotal: (
              total,
            ) =>
              `Total: ${total} docentes`,
          }}
        />
      </Card>

      {/* =====================================
          MODAL
      ====================================== */}

      <Modal
        title={
          docenteEditando
            ? 'Editar docente'
            : 'Nuevo docente'
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
            guardarDocente
          }
        >
          <Form.Item
            label="Nombre completo"
            name="nombre_completo"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese el nombre completo.',
              },

              {
                max:
                  150,

                message:
                  'Maximo 150 caracteres.',
              },
            ]}
          >
            <Input
              placeholder="Carlos Lopez"
            />
          </Form.Item>

          <Form.Item
            label="Correo"
            name="correo"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese el correo.',
              },

              {
                type:
                  'email',

                message:
                  'Ingrese un correo valido.',
              },

              {
                max:
                  150,

                message:
                  'Maximo 150 caracteres.',
              },
            ]}
          >
            <Input
              placeholder="carlos@escuela.com"
            />
          </Form.Item>

          <Form.Item
            label="Codigo docente"
            name="codigo_docente"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese el codigo del docente.',
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
              placeholder="DOC-001"
            />
          </Form.Item>

          {!docenteEditando && (
            <Form.Item
              label="Contraseña inicial"
              name="contrasena"
              rules={[
                {
                  required:
                    true,

                  message:
                    'Ingrese una contraseña inicial.',
                },

                {
                  min:
                    8,

                  message:
                    'La contraseña debe tener al menos 8 caracteres.',
                },

                {
                  max:
                    72,

                  message:
                    'Maximo 72 caracteres.',
                },
              ]}
            >
              <Input.Password
                placeholder="Contraseña inicial"
              />
            </Form.Item>
          )}

          {!docenteEditando && (
            <Text
              type="secondary"
              style={{
                display:
                  'block',

                marginBottom:
                  20,
              }}
            >
              Esta contraseña sera utilizada
              por el docente para iniciar
              sesion.
            </Text>
          )}

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
              {docenteEditando
                ? 'Guardar cambios'
                : 'Registrar docente'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}