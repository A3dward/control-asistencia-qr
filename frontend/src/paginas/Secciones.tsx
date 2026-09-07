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
  InputNumber,
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

interface Seccion {
  id: number;
  nombre: string;
  grado: string;
  anio_academico: number;
  activo: boolean;
  fecha_creacion?: string;
}

interface FormularioSeccion {
  nombre: string;
  grado: string;
  anio_academico: number;
}

export default function Secciones() {
  const navigate =
    useNavigate();

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
    modalAbierto,
    setModalAbierto,
  ] =
    useState(false);

  const [
    seccionEditando,
    setSeccionEditando,
  ] =
    useState<Seccion | null>(
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
    Form.useForm<FormularioSeccion>();

  // =====================================
  // OBTENER SECCIONES
  // =====================================

  const obtenerSecciones =
    async () => {
      setCargando(true);

      try {
        const respuesta =
          await api.get(
            '/secciones',
          );

        const datos =
          respuesta.data.datos ??
          [];

        const normalizadas =
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
          );

        setSecciones(
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
              'No fue posible obtener las secciones.',
          );
        } else {
          message.error(
            'Ocurrio un error al obtener las secciones.',
          );
        }
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerSecciones();
  }, []);

  // =====================================
  // NUEVA SECCION
  // =====================================

  const abrirNueva = () => {
    setSeccionEditando(
      null,
    );

    form.resetFields();

    form.setFieldsValue({
      anio_academico:
        new Date().getFullYear(),
    } as FormularioSeccion);

    setModalAbierto(
      true,
    );
  };

  // =====================================
  // EDITAR
  // =====================================

  const abrirEditar = (
    seccion: Seccion,
  ) => {
    setSeccionEditando(
      seccion,
    );

    form.setFieldsValue({
      nombre:
        seccion.nombre,

      grado:
        seccion.grado,

      anio_academico:
        seccion.anio_academico,
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

    setSeccionEditando(
      null,
    );

    form.resetFields();
  };

  // =====================================
  // GUARDAR
  // =====================================

  const guardarSeccion =
    async (
      valores:
        FormularioSeccion,
    ) => {
      setGuardando(true);

      try {
        if (
          seccionEditando
        ) {
          await api.patch(
            `/secciones/${seccionEditando.id}`,
            {
              nombre:
                valores.nombre,

              grado:
                valores.grado,

              anio_academico:
                valores.anio_academico,
            },
          );

          message.success(
            'Seccion actualizada correctamente.',
          );
        } else {
          await api.post(
            '/secciones',
            {
              nombre:
                valores.nombre,

              grado:
                valores.grado,

              anio_academico:
                valores.anio_academico,
            },
          );

          message.success(
            'Seccion registrada correctamente.',
          );
        }

        cerrarModal();

        await obtenerSecciones();
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
                'No fue posible guardar la seccion.',
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
  // ACTIVAR / DESACTIVAR
  // =====================================

  const cambiarEstado =
    async (
      seccion: Seccion,
    ) => {
      try {
        const ruta =
          seccion.activo
            ? `/secciones/${seccion.id}/desactivar`
            : `/secciones/${seccion.id}/activar`;

        await api.patch(
          ruta,
        );

        message.success(
          seccion.activo
            ? 'Seccion desactivada correctamente.'
            : 'Seccion activada correctamente.',
        );

        await obtenerSecciones();
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
              'No fue posible cambiar el estado de la seccion.',
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
    TableColumnsType<Seccion> =
    [
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
          'nombre',

        key:
          'nombre',
      },

      {
        title:
          'Año academico',

        dataIndex:
          'anio_academico',

        key:
          'anio_academico',

        width:
          150,
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
          250,

        render: (
          _,
          seccion,
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
                  seccion,
                )
              }
            >
              Editar
            </Button>

            <Popconfirm
              title={
                seccion.activo
                  ? 'Desactivar seccion'
                  : 'Activar seccion'
              }
              description={
                seccion.activo
                  ? '¿Desea desactivar esta seccion?'
                  : '¿Desea activar esta seccion?'
              }
              okText="Si"
              cancelText="No"
              onConfirm={() =>
                cambiarEstado(
                  seccion,
                )
              }
            >
              <Button
                danger={
                  seccion.activo
                }
                type={
                  seccion.activo
                    ? 'default'
                    : 'primary'
                }
                icon={
                  <PoweroffOutlined />
                }
              >
                {seccion.activo
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
            Secciones
          </Title>

          <Text
            type="secondary"
          >
            Administracion de grados,
            secciones y años academicos.
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
          Nueva seccion
        </Button>
      </div>

      <Card>
        <Table
          rowKey="id"
          columns={
            columnas
          }
          dataSource={
            secciones
          }
          loading={
            cargando
          }
          scroll={{
            x: 850,
          }}
          pagination={{
            pageSize:
              10,

            showSizeChanger:
              true,

            showTotal: (
              total,
            ) =>
              `Total: ${total} secciones`,
          }}
        />
      </Card>

      <Modal
        title={
          seccionEditando
            ? 'Editar seccion'
            : 'Nueva seccion'
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
            guardarSeccion
          }
        >
          <Form.Item
            label="Grado"
            name="grado"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese el grado.',
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
              placeholder="Ej. 3ro basico"
            />
          </Form.Item>

          <Form.Item
            label="Seccion"
            name="nombre"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese la seccion.',
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
              placeholder="Ej. Seccion A"
            />
          </Form.Item>

          <Form.Item
            label="Año academico"
            name="anio_academico"
            rules={[
              {
                required:
                  true,

                message:
                  'Ingrese el año academico.',
              },
            ]}
          >
            <InputNumber
              min={
                2000
              }
              max={
                2100
              }
              style={{
                width:
                  '100%',
              }}
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
              {seccionEditando
                ? 'Guardar cambios'
                : 'Registrar seccion'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}