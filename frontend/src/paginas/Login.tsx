import {
  LockOutlined,
  MailOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';

import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Typography,
} from 'antd';

import axios from 'axios';

import {
  useState,
} from 'react';

import {
  Navigate,
  useNavigate,
} from 'react-router-dom';

import {
  useAutenticacion,
} from '../contextos/AutenticacionContext';

const {
  Title,
  Text,
} = Typography;

interface FormularioLogin {
  correo:
    string;

  contrasena:
    string;
}

export default function Login() {
  const navigate =
    useNavigate();

  const {
    iniciarSesion,
    autenticado,
    usuario,
  } =
    useAutenticacion();

  const [
    enviando,
    setEnviando,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  // =====================================
  // USUARIO YA AUTENTICADO
  // =====================================

  if (
    autenticado &&
    usuario
  ) {
    return (
      <Navigate
        to={
          usuario.rol ===
          'ADMIN'
            ? '/admin'
            : '/docente'
        }
        replace
      />
    );
  }

  // =====================================
  // LOGIN
  // =====================================

  const enviarFormulario =
    async (
      valores:
        FormularioLogin,
    ) => {
      setError(
        '',
      );

      setEnviando(
        true,
      );

      try {
        const usuarioLogin =
          await iniciarSesion(
            valores.correo,
            valores.contrasena,
          );

        if (
          usuarioLogin.rol ===
          'ADMIN'
        ) {
          navigate(
            '/admin',
            {
              replace:
                true,
            },
          );

          return;
        }

        navigate(
          '/docente',
          {
            replace:
              true,
          },
        );
      } catch (
        errorPeticion
      ) {
        if (
          axios.isAxiosError(
            errorPeticion,
          )
        ) {
          const mensaje =
            errorPeticion.response
              ?.data
              ?.message;

          setError(
            mensaje ??
              'No fue posible iniciar sesión.',
          );
        } else {
          setError(
            'Ocurrió un error inesperado.',
          );
        }
      } finally {
        setEnviando(
          false,
        );
      }
    };

  // =====================================
  // VISTA
  // =====================================

  return (
    <div
      className="login-pagina"
    >
      <div
        className="login-contenedor"
      >
        {/* ================================= */}
        {/* PRESENTACION */}
        {/* ================================= */}

        <section
          className="login-presentacion"
        >
          <div
            className="login-marca"
          >
            <div
              className="login-marca-icono"
            >
              <QrcodeOutlined />
            </div>

            <div>
              <span
                className="login-marca-nombre"
              >
                Control de Asistencia
              </span>

              <span
                className="login-marca-subtitulo"
              >
                INEB de Telesecundaria
              </span>
            </div>
          </div>

          <div
            className="login-presentacion-contenido"
          >
            <span
              className="login-etiqueta"
            >
              Aldea Cabañas
            </span>

            <h1
              className="login-presentacion-titulo"
            >
              
            </h1>

            <p
              className="login-presentacion-texto"
            >
             registro de asistencia
              mediante código QR.
            </p>
          </div>

          <div
            className="login-presentacion-pie"
          >
            Nuevo San Carlos,
            Retalhuleu
          </div>
        </section>

        {/* ================================= */}
        {/* FORMULARIO */}
        {/* ================================= */}

        <section
          className="login-formulario"
        >
          <Card
            className="login-card"
            bordered={false}
          >
            <div
              className="login-encabezado"
            >
              <Title
                level={2}
                className="login-titulo"
              >
                Iniciar sesión
              </Title>

              <Text
                className="login-descripcion"
              >
                Ingrese sus
                credenciales para
                acceder al sistema.
              </Text>
            </div>

            {error && (
              <Alert
                message={
                  error
                }
                type="error"
                showIcon
                closable
                onClose={() =>
                  setError(
                    '',
                  )
                }
                style={{
                  marginBottom:
                    22,
                }}
              />
            )}

            <Form
              layout="vertical"
              onFinish={
                enviarFormulario
              }
              autoComplete="off"
            >
              <Form.Item
                label="Correo"
                name="correo"
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Ingrese su correo.',
                  },

                  {
                    type:
                      'email',

                    message:
                      'Ingrese un correo válido.',
                  },
                ]}
              >
                <Input
                  prefix={
                    <MailOutlined />
                  }
                  placeholder="correo@escuela.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Contraseña"
                name="contrasena"
                rules={[
                  {
                    required:
                      true,

                    message:
                      'Ingrese su contraseña.',
                  },
                ]}
              >
                <Input.Password
                  prefix={
                    <LockOutlined />
                  }
                  placeholder="Ingrese su contraseña"
                  size="large"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={
                  enviando
                }
                className="login-boton"
              >
                Iniciar sesión
              </Button>
            </Form>
          </Card>
        </section>
      </div>
    </div>
  );
}