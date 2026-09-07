import {
  ArrowLeftOutlined,
  PlusOutlined,
  PoweroffOutlined,
  UsergroupAddOutlined,
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

interface Estudiante {
  id: number;
  codigo_estudiante: string;
  nombres: string;
  apellidos: string;
  activo: boolean;
}

interface Seccion {
  id: number;
  nombre: string;
  grado: string;
  anio_academico: number;
  activo: boolean;
}

interface Inscripcion {
  id: number;
  estudiante_id: number;
  seccion_id: number;
  fecha_inscripcion: string;
  activo: boolean;

  codigo_estudiante: string;
  nombres: string;
  apellidos: string;

  seccion: string;
  grado: string;
  anio_academico: number;
}

interface FormularioInscripcion {
  estudiante_id: number;
  seccion_id: number;
}

// =====================================
// COMPONENTE
// =====================================

export default function Inscripciones() {
  const navigate =
    useNavigate();

  const [
    inscripciones,
    setInscripciones,
  ] =
    useState<Inscripcion[]>([]);

  const [
    estudiantes,
    setEstudiantes,
  ] =
    useState<Estudiante[]>([]);

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
    Form.useForm<FormularioInscripcion>();

  // =====================================
  // CARGAR INSCRIPCIONES
  // =====================================

  const obtenerInscripciones =
    async () => {
      setCargando(true);

      try {
        const respuesta =
          await api.get(
            '/inscripciones',
          );

        const datos =
          respuesta.data.datos ??
          [];

        const normalizadas =
          datos.map(
            (
              inscripcion: any,
            ) => ({
              ...inscripcion,

              id:
                Number(
                  inscripcion.id,
                ),

              estudiante_id:
                Number(
                  inscripcion.estudiante_id,
                ),

              seccion_id:
                Number(
                  inscripcion.seccion_id,
                ),

              anio_academico:
                Number(
                  inscripcion.anio_academico,
                ),

              activo:
                Boolean(
                  inscripcion.activo,
                ),
            }),
          );

        setInscripciones(
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
              'No fue posible obtener las inscripciones.',
          );
        } else {
          message.error(
            'Ocurrio un error al obtener las inscripciones.',
          );
        }
      } finally {
        setCargando(false);
      }
    };

  // =====================================
  // CARGAR ESTUDIANTES
  // =====================================

  const obtenerEstudiantes =
    async () => {
      try {
        const respuesta =
          await api.get(
            '/estudiantes',
          );

        const datos =
          respuesta.data.datos ??
          [];

        const normalizados =
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
          normalizados,
        );
      } catch {
        message.error(
          'No fue posible cargar los estudiantes.',
        );
      }
    };

  // =====================================
  // CARGAR SECCIONES
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
      } catch {
        message.error(
          'No fue posible cargar las secciones.',
        );
      }
    };

  useEffect(() => {
    obtenerInscripciones();
    obtenerEstudiantes();
    obtenerSecciones();
  }, []);

  // =====================================
  // ABRIR NUEVA INSCRIPCION
  // =====================================

  const abrirNueva = () => {
    form.resetFields();

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

    form.resetFields();
  };

  // =====================================
  // CREAR INSCRIPCION
  // =====================================

  const guardarInscripcion =
    async (
      valores:
        FormularioInscripcion,
    ) => {
      setGuardando(true);

      try {
        await api.post(
          '/inscripciones',
          {
            estudiante_id:
              valores.estudiante_id,

            seccion_id:
              valores.seccion_id,
          },
        );

        message.success(
          'Estudiante asignado a la seccion correctamente.',
        );

        cerrarModal();

        await obtenerInscripciones();
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
                'No fue posible registrar la inscripcion.',
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
      inscripcion: Inscripcion,
    ) => {
      try {
        const ruta =
          inscripcion.activo
            ? `/inscripciones/${inscripcion.id}/desactivar`
            : `/inscripciones/${inscripcion.id}/activar`;

        await api.patch(
          ruta,
        );

        message.success(
          inscripcion.activo
            ? 'Inscripcion desactivada correctamente.'
            : 'Inscripcion activada correctamente.',
        );

        await obtenerInscripciones();
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
              'No fue posible cambiar el estado de la inscripcion.',
          );
        } else {
          message.error(
            'Ocurrio un error inesperado.',
          );
        }
      }
    };

  // =====================================
  // DATOS PARA SELECTS
  // =====================================

  const opcionesEstudiantes =
    estudiantes
      .filter(
        (
          estudiante,
        ) =>
          estudiante.activo,
      )
      .map(
        (
          estudiante,
        ) => ({
          value:
            estudiante.id,

          label:
            `${estudiante.codigo_estudiante} - ${estudiante.nombres} ${estudiante.apellidos}`,
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
    TableColumnsType<Inscripcion> =
    [
      {
        title:
          'Codigo',

        dataIndex:
          'codigo_estudiante',

        key:
          'codigo_estudiante',

        width:
          130,
      },

      {
        title:
          'Estudiante',

        key:
          'estudiante',

        render: (
          _,
          inscripcion,
        ) =>
          `${inscripcion.nombres} ${inscripcion.apellidos}`,
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
          170,

        render: (
          _,
          inscripcion,
        ) => (
          <Space>
            <Popconfirm
              title={
                inscripcion.activo
                  ? 'Desactivar inscripcion'
                  : 'Activar inscripcion'
              }
              description={
                inscripcion.activo
                  ? '¿Desea desactivar esta inscripcion?'
                  : '¿Desea activar nuevamente esta inscripcion?'
              }
              okText="Si"
              cancelText="No"
              onConfirm={() =>
                cambiarEstado(
                  inscripcion,
                )
              }
            >
              <Button
                danger={
                  inscripcion.activo
                }
                type={
                  inscripcion.activo
                    ? 'default'
                    : 'primary'
                }
                icon={
                  <PoweroffOutlined />
                }
              >
                {inscripcion.activo
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
            Inscripciones
          </Title>

          <Text
            type="secondary"
          >
            Asignacion de estudiantes
            a grados y secciones.
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
          Nueva inscripcion
        </Button>
      </div>

      {/* =====================================
          INFORMACION
      ====================================== */}

      <Alert
        type="info"
        showIcon
        icon={
          <UsergroupAddOutlined />
        }
        message="Asignacion de estudiantes"
        description="Cada estudiante puede tener solamente una seccion activa por año academico."
        style={{
          marginBottom:
            20,
        }}
      />

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
            inscripciones
          }
          loading={
            cargando
          }
          scroll={{
            x:
              1000,
          }}
          pagination={{
            pageSize:
              10,

            showSizeChanger:
              true,

            showTotal: (
              total,
            ) =>
              `Total: ${total} inscripciones`,
          }}
        />
      </Card>

      {/* =====================================
          MODAL
      ====================================== */}

      <Modal
        title="Nueva inscripcion"
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
            guardarInscripcion
          }
        >
          <Form.Item
            label="Estudiante"
            name="estudiante_id"
            rules={[
              {
                required:
                  true,

                message:
                  'Seleccione un estudiante.',
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Seleccione un estudiante"
              options={
                opcionesEstudiantes
              }
              optionFilterProp="label"
              notFoundContent="No hay estudiantes activos"
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
              Registrar inscripcion
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}