import {
  ArrowLeftOutlined,
  BookOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
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

interface Seccion {
  id: number;

  nombre: string;

  grado: string;

  anio_academico: number;

  activo: boolean;
}

interface Asignacion {
  asignacion_id: number;

  activo: boolean;

  curso_id: number;

  codigo_curso: string;

  curso: string;

  seccion_id: number;

  seccion: string;

  grado: string;

  anio_academico: number;
}

interface FormularioClase {
  grado: string;

  seccion?: string;

  anio_academico: number;
}

interface FormularioCurso {
  seccion_id: number;

  nombre: string;
}

interface ClaseAgrupada {
  id: number;

  grado: string;

  seccion: string;

  anio_academico: number;

  cursos: Array<{
    id: number;

    nombre: string;

    codigo: string;
  }>;
}

// =====================================
// COMPONENTE
// =====================================

export default function MisClases() {
  const navigate =
    useNavigate();

  const [
    formClase,
  ] =
    Form.useForm<FormularioClase>();

  const [
    formCurso,
  ] =
    Form.useForm<FormularioCurso>();

  const [
    secciones,
    setSecciones,
  ] =
    useState<Seccion[]>([]);

  const [
    asignaciones,
    setAsignaciones,
  ] =
    useState<Asignacion[]>([]);

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    creandoClase,
    setCreandoClase,
  ] =
    useState(false);

  const [
    creandoCurso,
    setCreandoCurso,
  ] =
    useState(false);

  // =====================================
  // MENSAJES
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
  // TEXTO CLASE
  // =====================================

  const obtenerNombreClase = (
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
      seccion.toLowerCase() !==
        'general';

    return mostrarSeccion
      ? `${clase.grado} - Seccion ${seccion} - ${clase.anio_academico}`
      : `${clase.grado} - ${clase.anio_academico}`;
  };

  // =====================================
  // CARGAR DATOS
  // =====================================

  const cargarDatos =
    async () => {
      try {
        setCargando(
          true,
        );

        const [
          respuestaSecciones,
          respuestaAsignaciones,
        ] =
          await Promise.all([
            api.get(
              '/secciones',
            ),

            api.get(
              '/asignaciones/mis-asignaciones',
            ),
          ]);

        setSecciones(
          respuestaSecciones
            .data
            .datos ?? [],
        );

        setAsignaciones(
          respuestaAsignaciones
            .data
            .datos ?? [],
        );
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar las clases.',
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

  // =====================================
  // AGRUPAR MIS CLASES
  // =====================================

  const misClases =
    useMemo(
      () => {
        const mapa =
          new Map<
            number,
            ClaseAgrupada
          >();

        asignaciones
          .filter(
            (
              item,
            ) =>
              Boolean(
                item.activo,
              ),
          )
          .forEach(
            (
              item,
            ) => {
              const seccionId =
                Number(
                  item.seccion_id,
                );

              if (
                !mapa.has(
                  seccionId,
                )
              ) {
                mapa.set(
                  seccionId,
                  {
                    id:
                      seccionId,

                    grado:
                      item.grado,

                    seccion:
                      item.seccion,

                    anio_academico:
                      item.anio_academico,

                    cursos:
                      [],
                  },
                );
              }

              const clase =
                mapa.get(
                  seccionId,
                )!;

              const existeCurso =
                clase.cursos.some(
                  (
                    curso,
                  ) =>
                    Number(
                      curso.id,
                    ) ===
                    Number(
                      item.curso_id,
                    ),
                );

              if (
                !existeCurso
              ) {
                clase.cursos.push(
                  {
                    id:
                      Number(
                        item.curso_id,
                      ),

                    nombre:
                      item.curso,

                    codigo:
                      item.codigo_curso,
                  },
                );
              }
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
  // CREAR CLASE
  // =====================================

  const crearClase =
    async (
      valores:
        FormularioClase,
    ) => {
      try {
        setCreandoClase(
          true,
        );

        const respuesta =
          await api.post(
            '/secciones',
            {
              nombre:
                valores.seccion
                  ?.trim() ||
                'General',

              grado:
                valores.grado.trim(),

              anio_academico:
                Number(
                  valores.anio_academico,
                ),
            },
          );

        const nuevaClase =
          respuesta.data
            .datos;

        await cargarDatos();

        formClase.resetFields();

        formCurso.setFieldsValue(
          {
            seccion_id:
              Number(
                nuevaClase.id,
              ),
          },
        );

        message.success(
          'Clase creada. Ahora agregue sus cursos.',
        );
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible crear la clase.',
          ),
        );
      } finally {
        setCreandoClase(
          false,
        );
      }
    };

  // =====================================
  // CREAR CURSO Y ASOCIAR
  // =====================================

  const crearCurso =
    async (
      valores:
        FormularioCurso,
    ) => {
      try {
        setCreandoCurso(
          true,
        );

        // =================================
        // EVITAR NOMBRE DUPLICADO
        // PARA ESTE DOCENTE / CLASE
        // =================================

        const nombreNormalizado =
          valores.nombre
            .trim()
            .toLowerCase();

        const yaExiste =
          asignaciones.some(
            (
              item,
            ) =>
              Boolean(
                item.activo,
              ) &&
              Number(
                item.seccion_id,
              ) ===
                Number(
                  valores.seccion_id,
                ) &&
              item.curso
                .trim()
                .toLowerCase() ===
                nombreNormalizado,
          );

        if (yaExiste) {
          message.warning(
            'Ese curso ya se encuentra en esta clase.',
          );

          return;
        }

        // =================================
        // CREAR CURSO
        // =================================

        const respuestaCurso =
          await api.post(
            '/cursos',
            {
              nombre:
                valores.nombre.trim(),
            },
          );

        const curso =
          respuestaCurso.data
            .datos;

        // =================================
        // ASOCIAR CURSO A CLASE
        // =================================

        await api.post(
          '/asignaciones/autoasignar',
          {
            curso_id:
              Number(
                curso.id,
              ),

            seccion_id:
              Number(
                valores.seccion_id,
              ),
          },
        );

        formCurso.resetFields(
          [
            'nombre',
          ],
        );

        await cargarDatos();

        message.success(
          'Curso creado y agregado a la clase correctamente.',
        );
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible agregar el curso.',
          ),
        );
      } finally {
        setCreandoCurso(
          false,
        );
      }
    };

  // =====================================
  // CARGANDO
  // =====================================

  if (cargando) {
    return (
      <div
        style={{
          minHeight:
            '100vh',

          display:
            'flex',

          alignItems:
            'center',

          justifyContent:
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
          1100,

        margin:
          '0 auto',

        padding:
          24,
      }}
    >
      <Space
        style={{
          marginBottom:
            20,
        }}
      >
        <Button
          icon={
            <ArrowLeftOutlined />
          }
          onClick={() =>
            navigate(
              '/docente',
            )
          }
        >
          Regresar
        </Button>

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
      </Space>

      <Title level={2}>
        Mis clases y cursos
      </Title>

      <Text
        type="secondary"
      >
        Cree las clases que
        necesita y agregue los
        cursos que imparte en
        cada una.
      </Text>

      {/* ================================= */}
      {/* MIS CLASES */}
      {/* ================================= */}

      <Card
        title={
          <Space>
            <BookOutlined />

            Mis clases
          </Space>
        }
        style={{
          marginTop:
            24,

          marginBottom:
            24,
        }}
      >
        {misClases.length ===
        0 ? (
          <Alert
            type="info"
            showIcon
            message="Todavia no tiene clases con cursos."
            description="Cree una clase y luego agregue al menos un curso."
          />
        ) : (
          <List
            dataSource={
              misClases
            }
            renderItem={(
              clase,
            ) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    obtenerNombreClase(
                      clase,
                    )
                  }
                  description={
                    <Space
                      wrap
                      style={{
                        marginTop:
                          8,
                      }}
                    >
                      {clase.cursos.map(
                        (
                          curso,
                        ) => (
                          <Tag
                            color="blue"
                            key={
                              curso.id
                            }
                          >
                            {
                              curso.nombre
                            }
                          </Tag>
                        ),
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* ================================= */}
      {/* CREAR CLASE */}
      {/* ================================= */}

      <Card
        title={
          <Space>
            <PlusOutlined />

            Crear nueva clase
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
          message="Ejemplo: Primero Basico - 2026"
          description="La seccion es opcional. Utilicela solamente si existen grupos A, B, C, etc."
          style={{
            marginBottom:
              20,
          }}
        />

        <Form
          form={
            formClase
          }
          layout="vertical"
          initialValues={{
            anio_academico:
              new Date()
                .getFullYear(),
          }}
          onFinish={
            crearClase
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
              md={10}
            >
              <Form.Item
                name="grado"
                label="Clase o grado"
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Ingrese la clase o grado.',
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ejemplo: Primero Basico"
                  maxLength={
                    100
                  }
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={7}
            >
              <Form.Item
                name="seccion"
                label="Seccion (opcional)"
              >
                <Input
                  size="large"
                  placeholder="Ejemplo: A"
                  maxLength={
                    100
                  }
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={7}
            >
              <Form.Item
                name="anio_academico"
                label="Ciclo escolar"
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Ingrese el ciclo escolar.',
                  },
                ]}
              >
                <InputNumber
                  size="large"
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
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={
              <PlusOutlined />
            }
            loading={
              creandoClase
            }
          >
            Crear clase
          </Button>
        </Form>
      </Card>

      {/* ================================= */}
      {/* AGREGAR CURSO */}
      {/* ================================= */}

      <Card
        title={
          <Space>
            <PlusOutlined />

            Agregar curso a una clase
          </Space>
        }
      >
        <Alert
          type="success"
          showIcon
          message="El codigo del curso se genera automaticamente."
          description="Solo seleccione la clase y escriba el nombre del curso."
          style={{
            marginBottom:
              20,
          }}
        />

        <Form
          form={
            formCurso
          }
          layout="vertical"
          onFinish={
            crearCurso
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
                  options={
                    secciones
                      .filter(
                        (
                          item,
                        ) =>
                          Boolean(
                            item.activo,
                          ),
                      )
                      .map(
                        (
                          item,
                        ) => ({
                          value:
                            item.id,

                          label:
                            obtenerNombreClase(
                              item,
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
                name="nombre"
                label="Nombre del curso"
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Ingrese el nombre del curso.',
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ejemplo: Matematicas"
                  maxLength={
                    120
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={
              <PlusOutlined />
            }
            loading={
              creandoCurso
            }
          >
            Agregar curso
          </Button>
        </Form>
      </Card>
    </div>
  );
}