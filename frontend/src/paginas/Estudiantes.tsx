import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  PoweroffOutlined,
  QrcodeOutlined,
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

interface Estudiante {
  id: number;

  codigo_estudiante: string;

  nombres: string;

  apellidos: string;

  token_qr: string;

  activo: boolean;

  fecha_creacion?: string;

  fecha_actualizacion?: string | null;
}

interface FormularioEstudiante {
  codigo_estudiante: string;

  nombres: string;

  apellidos: string;
}

// =====================================
// COMPONENTE
// =====================================

export default function Estudiantes() {
  const navigate =
    useNavigate();

  const [
    estudiantes,
    setEstudiantes,
  ] =
    useState<Estudiante[]>(
      [],
    );

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
    estudianteEditando,
    setEstudianteEditando,
  ] =
    useState<Estudiante | null>(
      null,
    );

  const [
    guardando,
    setGuardando,
  ] =
    useState(false);

  const [
    modalQrAbierto,
    setModalQrAbierto,
  ] =
    useState(false);

  const [
    qrUrl,
    setQrUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    estudianteQr,
    setEstudianteQr,
  ] =
    useState<Estudiante | null>(
      null,
    );

  const [
    cargandoQr,
    setCargandoQr,
  ] =
    useState(false);

  const [
    form,
  ] =
    Form.useForm<FormularioEstudiante>();

  // =====================================
  // OBTENER ESTUDIANTES
  // =====================================

  const obtenerEstudiantes =
    async () => {
      setCargando(true);

      try {
        const respuesta =
          await api.get(
            '/estudiantes',
          );

        const datos =
          respuesta.data.datos ??
          [];

        const estudiantesNormalizados =
          datos.map(
            (
              estudiante: any,
            ) => ({
              ...estudiante,

              id:
                Number(
                  estudiante.id,
                ),

              activo:
                Boolean(
                  estudiante.activo,
                ),
            }),
          );

        setEstudiantes(
          estudiantesNormalizados,
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
              'No fue posible obtener los estudiantes.',
          );
        } else {
          message.error(
            'Ocurrio un error al obtener los estudiantes.',
          );
        }
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  // =====================================
  // NUEVO ESTUDIANTE
  // =====================================

  const abrirNuevo = () => {
    setEstudianteEditando(
      null,
    );

    form.resetFields();

    setModalAbierto(
      true,
    );
  };

  // =====================================
  // EDITAR
  // =====================================

  const abrirEditar = (
    estudiante: Estudiante,
  ) => {
    setEstudianteEditando(
      estudiante,
    );

    form.setFieldsValue({
      codigo_estudiante:
        estudiante.codigo_estudiante,

      nombres:
        estudiante.nombres,

      apellidos:
        estudiante.apellidos,
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

    setEstudianteEditando(
      null,
    );

    form.resetFields();
  };

  // =====================================
  // GUARDAR
  // =====================================

  const guardarEstudiante =
    async (
      valores:
        FormularioEstudiante,
    ) => {
      setGuardando(true);

      try {
        if (
          estudianteEditando
        ) {
          await api.patch(
            `/estudiantes/${estudianteEditando.id}`,
            {
              codigo_estudiante:
                valores.codigo_estudiante,

              nombres:
                valores.nombres,

              apellidos:
                valores.apellidos,
            },
          );

          message.success(
            'Estudiante actualizado correctamente.',
          );
        } else {
          await api.post(
            '/estudiantes',
            {
              codigo_estudiante:
                valores.codigo_estudiante,

              nombres:
                valores.nombres,

              apellidos:
                valores.apellidos,
            },
          );

          message.success(
            'Estudiante registrado correctamente.',
          );
        }

        cerrarModal();

        await obtenerEstudiantes();
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
                'No fue posible guardar el estudiante.',
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
      estudiante: Estudiante,
    ) => {
      try {
        const ruta =
          estudiante.activo
            ? `/estudiantes/${estudiante.id}/desactivar`
            : `/estudiantes/${estudiante.id}/activar`;

        await api.patch(
          ruta,
        );

        message.success(
          estudiante.activo
            ? 'Estudiante desactivado correctamente.'
            : 'Estudiante activado correctamente.',
        );

        await obtenerEstudiantes();
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
  // OBTENER QR
  // =====================================

  const abrirQr =
    async (
      estudiante: Estudiante,
    ) => {
      setEstudianteQr(
        estudiante,
      );

      setModalQrAbierto(
        true,
      );

      setCargandoQr(
        true,
      );

      try {
        const respuesta =
          await api.get(
            `/estudiantes/${estudiante.id}/qr`,
            {
              responseType:
                'blob',
            },
          );

        const url =
          URL.createObjectURL(
            respuesta.data,
          );

        setQrUrl(
          url,
        );
      } catch (error) {
        message.error(
          axios.isAxiosError(
            error,
          )
            ? 'No fue posible obtener el codigo QR.'
            : 'Ocurrio un error al cargar el QR.',
        );

        setModalQrAbierto(
          false,
        );
      } finally {
        setCargandoQr(
          false,
        );
      }
    };

  // =====================================
  // CERRAR QR
  // =====================================

  const cerrarQr = () => {
    if (qrUrl) {
      URL.revokeObjectURL(
        qrUrl,
      );
    }

    setQrUrl(
      null,
    );

    setEstudianteQr(
      null,
    );

    setModalQrAbierto(
      false,
    );
  };

  // =====================================
  // COLUMNAS
  // =====================================

  const columnas:
    TableColumnsType<Estudiante> =
    [
      {
        title:
          'Codigo',

        dataIndex:
          'codigo_estudiante',

        key:
          'codigo_estudiante',

        width:
          140,
      },

      {
        title:
          'Nombres',

        dataIndex:
          'nombres',

        key:
          'nombres',
      },

      {
        title:
          'Apellidos',

        dataIndex:
          'apellidos',

        key:
          'apellidos',
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
          310,

        render: (
          _,
          estudiante,
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
                  estudiante,
                )
              }
            >
              Editar
            </Button>

            <Button
              icon={
                <QrcodeOutlined />
              }
              disabled={
                !estudiante.activo
              }
              onClick={() =>
                abrirQr(
                  estudiante,
                )
              }
            >
              QR
            </Button>

            <Popconfirm
              title={
                estudiante.activo
                  ? 'Desactivar estudiante'
                  : 'Activar estudiante'
              }
              description={
                estudiante.activo
                  ? '¿Desea desactivar este estudiante?'
                  : '¿Desea activar este estudiante?'
              }
              okText="Si"
              cancelText="No"
              onConfirm={() =>
                cambiarEstado(
                  estudiante,
                )
              }
            >
              <Button
                danger={
                  estudiante.activo
                }
                type={
                  estudiante.activo
                    ? 'default'
                    : 'primary'
                }
                icon={
                  <PoweroffOutlined />
                }
              >
                {estudiante.activo
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
            Estudiantes
          </Title>

          <Text
            type="secondary"
          >
            Registro y administracion
            de estudiantes del
            establecimiento.
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
          Nuevo estudiante
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
            estudiantes
          }
          loading={
            cargando
          }
          scroll={{
            x: 950,
          }}
          pagination={{
            pageSize: 10,

            showSizeChanger:
              true,

            showTotal: (
              total,
            ) =>
              `Total: ${total} estudiantes`,
          }}
        />
      </Card>

      {/* =====================================
          MODAL CREAR / EDITAR
      ====================================== */}

      <Modal
        title={
          estudianteEditando
            ? 'Editar estudiante'
            : 'Nuevo estudiante'
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
            guardarEstudiante
          }
        >
          <Form.Item
            label="Codigo del estudiante"
            name="codigo_estudiante"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese el codigo del estudiante.',
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
              placeholder="EST-001"
            />
          </Form.Item>

          <Form.Item
            label="Nombres"
            name="nombres"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese los nombres.',
              },

              {
                max:
                  100,

                message:
                  'Maximo 100 caracteres.',
              },
            ]}
          >
            <Input
              placeholder="Ana Maria"
            />
          </Form.Item>

          <Form.Item
            label="Apellidos"
            name="apellidos"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese los apellidos.',
              },

              {
                max:
                  100,

                message:
                  'Maximo 100 caracteres.',
              },
            ]}
          >
            <Input
              placeholder="Lopez Garcia"
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
              {estudianteEditando
                ? 'Guardar cambios'
                : 'Registrar estudiante'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* =====================================
          MODAL QR
      ====================================== */}

      <Modal
        title="Codigo QR del estudiante"
        open={
          modalQrAbierto
        }
        onCancel={
          cerrarQr
        }
        footer={[
          <Button
            key="cerrar"
            onClick={
              cerrarQr
            }
          >
            Cerrar
          </Button>,
        ]}
      >
        <div className="qr-contenedor">
          {estudianteQr && (
            <>
              <Title
                level={4}
                style={{
                  marginBottom:
                    4,
                }}
              >
                {
                  estudianteQr.nombres
                }{' '}
                {
                  estudianteQr.apellidos
                }
              </Title>

              <Text
                type="secondary"
              >
                {
                  estudianteQr.codigo_estudiante
                }
              </Text>
            </>
          )}

          <div className="qr-imagen-contenedor">
            {cargandoQr ? (
              <Text>
                Cargando codigo QR...
              </Text>
            ) : (
              qrUrl && (
                <img
                  src={
                    qrUrl
                  }
                  alt="Codigo QR del estudiante"
                  className="qr-imagen"
                />
              )
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}