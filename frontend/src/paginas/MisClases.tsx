import {
  ArrowLeftOutlined,
  BookOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  List,
  message,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';

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
  curso_id: number;

  codigo: string;

  nombre: string;
}

interface Clase {
  docente_seccion_id: number;

  seccion_id: number;

  seccion: string;

  grado: string;

  anio_academico: number;

  cursos: Curso[];
}

export default function MisClases() {
  const navigate =
    useNavigate();

  const [
    clases,
    setClases,
  ] =
    useState<Clase[]>([]);

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const obtenerMensajeError = (
    error: any,
    predeterminado: string,
  ) => {
    return (
      error.response
        ?.data
        ?.message ??
      predeterminado
    );
  };

  const nombreClase = (
    clase: Clase,
  ) => {
    const mostrarSeccion =
      clase.seccion &&
      clase.seccion
        .toLowerCase() !==
        'general';

    return mostrarSeccion
      ? `${clase.grado} - Seccion ${clase.seccion} - ${clase.anio_academico}`
      : `${clase.grado} - ${clase.anio_academico}`;
  };

  const cargarClases =
    async () => {
      try {
        setCargando(
          true,
        );

        const respuesta =
          await api.get(
            '/gestion-clases/mis-clases',
          );

        setClases(
          respuesta.data
            .datos ?? [],
        );
      } catch (
        error: any
      ) {
        message.error(
          obtenerMensajeError(
            error,
            'No fue posible cargar sus clases.',
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
      cargarClases();
    },
    [],
  );

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

  return (
    <div
      style={{
        maxWidth:
          1000,

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
            cargarClases
          }
        >
          Actualizar
        </Button>
      </Space>

      <Title level={2}>
        Mis clases
      </Title>

      <Text
        type="secondary"
      >
        Consulte las clases que
        tiene asignadas y sus
        respectivos cursos.
      </Text>

      <Card
        title={
          <Space>
            <BookOutlined />

            Clases asignadas
          </Space>
        }
        style={{
          marginTop:
            24,
        }}
      >
        {clases.length ===
        0 ? (
          <Alert
            type="info"
            showIcon
            message="No tiene clases asignadas."
            description="El administrador debe asignarle una clase."
          />
        ) : (
          <List
            dataSource={
              clases
            }
            renderItem={(
              clase,
            ) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    nombreClase(
                      clase,
                    )
                  }
                  description={
                    <div>
                      <Text
                        type="secondary"
                      >
                        Cursos asignados:
                      </Text>

                      <div
                        style={{
                          marginTop:
                            10,
                        }}
                      >
                        <Space wrap>
                          {clase.cursos.map(
                            (
                              curso,
                            ) => (
                              <Tag
                                color="blue"
                                key={
                                  curso.curso_id
                                }
                              >
                                {
                                  curso.nombre
                                }
                              </Tag>
                            ),
                          )}
                        </Space>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}