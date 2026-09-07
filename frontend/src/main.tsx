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
      <ConfigProvider>
        <AutenticacionProvider>
          <App />
        </AutenticacionProvider>
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
);