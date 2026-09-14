import {
  StrictMode,
} from 'react';

import {
  createRoot,
} from 'react-dom/client';

import {
  BrowserRouter,
} from 'react-router-dom';

import {
  ConfigProvider,
} from 'antd';

import './index.css';

import App from './App';

import {
  AutenticacionProvider,
} from './contextos/AutenticacionContext';

createRoot(
  document.getElementById(
    'root',
  )!,
).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary:
              '#1f4e68',

            colorInfo:
              '#1f4e68',

            colorSuccess:
              '#2e7d32',

            colorWarning:
              '#b7791f',

            colorError:
              '#b42318',

            colorText:
              '#1f2937',

            colorTextSecondary:
              '#667085',

            colorBgLayout:
              '#f4f6f8',

            colorBgContainer:
              '#ffffff',

            colorBorder:
              '#e4e7ec',

            borderRadius:
              8,

            borderRadiusLG:
              12,

            controlHeight:
              40,

            fontFamily:
              '"Segoe UI", Arial, Helvetica, sans-serif',
          },
        }}
      >
        <AutenticacionProvider>
          <App />
        </AutenticacionProvider>
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
);