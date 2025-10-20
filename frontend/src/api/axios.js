// file: src/api/axios.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Añadir token JWT
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor: Manejo global de errores
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado o inválido
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Acceso denegado:', data.message);
          break;
        case 404:
          console.error('Recurso no encontrado:', data.message);
          break;
        case 500:
          console.error('Error del servidor:', data.message);
          break;
        default:
          console.error('Error:', data.message || 'Error desconocido');
      }
    } else if (error.request) {
      console.error('Error de red: No se pudo conectar con el servidor');
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;