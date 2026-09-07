import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    'http://localhost:3000/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================
// AGREGAR TOKEN AUTOMATICAMENTE
// =====================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'access_token',
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// =====================================
// MANEJAR TOKEN VENCIDO
// =====================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        'access_token',
      );

      localStorage.removeItem(
        'usuario',
      );
    }

    return Promise.reject(error);
  },
);

export default api;