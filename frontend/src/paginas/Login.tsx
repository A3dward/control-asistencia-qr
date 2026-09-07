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
  correo: string;

  contrasena: string;
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

  const enviarFormulario =
    async (
      valores:
        FormularioLogin,
    ) => {
      setError('');
      setEnviando(true);

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
              replace: true,
            },
          );

          return;
        }

        navigate(
          '/docente',
          {
            replace: true,
          },
        );
      } catch (errorPeticion) {
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
              'No fue posible iniciar sesion.',
          );
        } else {
          setError(
            'Ocurrio un error inesperado.',
          );
        }
      } finally {
        setEnviando(false);
      }
    };

  return (
    <div className="login-pagina">
      <Card
        className="login-card"
        bordered={false}
      >
        <div className="login-encabezado">
          <div className="login-icono">
            <QrcodeOutlined />
          </div>

          <Title
            level={2}
            className="login-titulo"
          >
            Control de Asistencia
          </Title>

          <Text
            type="secondary"
          >
            Sistema de registro
            de asistencia mediante
            codigo QR
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() =>
              setError('')
            }
            style={{
              marginBottom: 20,
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
                required: true,
                message:
                  'Ingrese su correo.',
              },
              {
                type: 'email',
                message:
                  'Ingrese un correo valido.',
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
                required: true,
                message:
                  'Ingrese su contraseña.',
              },
            ]}
          >
            <Input.Password
              prefix={
                <LockOutlined />
              }
              placeholder="Contraseña"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={enviando}
          >
            Iniciar sesion
          </Button>
        </Form>
      </Card>
    </div>
  );
}