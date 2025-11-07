// file: frontend/src/api/axios.js
import axios from 'axios';

// 🔍 DEBUG: Ver qué valor tiene la variable de entorno
const VITE_URL = import.meta.env.VITE_API_URL;
console.log('🔍 [axios.js] VITE_API_URL desde .env:', VITE_URL);
console.log('🔍 [axios.js] typeof VITE_API_URL:', typeof VITE_URL);

// Construir baseURL
const BASE_URL = VITE_URL || 'http://localhost:5000';
console.log('🔍 [axios.js] BASE_URL (sin /api):', BASE_URL);

const FULL_BASE_URL = `${BASE_URL}/api`;
console.log('🔍 [axios.js] FULL_BASE_URL (con /api):', FULL_BASE_URL);

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: FULL_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Verificar que se creó correctamente
console.log('✅ [axios.js] axiosInstance.defaults.baseURL:', axiosInstance.defaults.baseURL);

// Request interceptor: Añadir token JWT y DEBUG
axiosInstance.interceptors.request.use(
  (config) => {
    // 🔍 DEBUG: Mostrar URL completa que se va a llamar
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('🌐 [REQUEST] URL completa:', fullUrl);
    console.log('🌐 [REQUEST] Method:', config.method?.toUpperCase());
    console.log('🌐 [REQUEST] Data:', config.data);
    
    // Agregar token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 [REQUEST] Token agregado');
    } else {
      console.log('⚠️ [REQUEST] Sin token');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [REQUEST] Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Manejo global de errores y DEBUG
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ [RESPONSE] Status:', response.status);
    console.log('✅ [RESPONSE] Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ [RESPONSE] Error completo:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      console.error(`❌ [RESPONSE] Status ${status}:`, data);

      switch (status) {
        case 401:
          console.warn('⚠️ [RESPONSE] Token inválido o expirado, limpiando sesión');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            console.warn('⚠️ [RESPONSE] Redirigiendo a /login');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('❌ [RESPONSE] Acceso denegado:', data.message);
          break;
        case 404:
          console.error('❌ [RESPONSE] Recurso no encontrado:', data.message);
          break;
        case 500:
          console.error('❌ [RESPONSE] Error del servidor:', data.message);
          break;
        default:
          console.error('❌ [RESPONSE] Error:', data.message || 'Error desconocido');
      }
    } else if (error.request) {
      console.error('❌ [RESPONSE] No se recibió respuesta del servidor');
      console.error('❌ [RESPONSE] Request:', error.request);
    } else {
      console.error('❌ [RESPONSE] Error en configuración:', error.message);
    }

    return Promise.reject(error);
  }
);

console.log('✅ [axios.js] axiosInstance configurada y exportada');

export default axiosInstance;