// file: frontend/src/api/documentos.js
import axiosInstance from './axios';

export const documentosAPI = {
  /**
   * Subir documento (CV, certificado, título, etc)
   * @param {FormData} formData - FormData con file y metadata
   */
  uploadDocumento: async (formData) => {
    return await axiosInstance.post('/documentos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Obtener todos los documentos del usuario actual
   * @param {string} tipo - Filtrar por tipo (opcional)
   */
  getMisDocumentos: async (tipo = null) => {
    const params = tipo ? { tipo } : {};
    return await axiosInstance.get('/documentos', { params });
  },

  /**
   * Obtener documento específico por ID
   */
  getDocumento: async (id) => {
    return await axiosInstance.get(`/documentos/${id}`);
  },

  /**
   * Verificar integridad del documento (hash SHA256)
   */
  verificarIntegridad: async (id) => {
    return await axiosInstance.get(`/documentos/${id}/verificar`);
  },

  /**
   * Eliminar documento
   */
  eliminarDocumento: async (id) => {
    return await axiosInstance.delete(`/documentos/${id}`);
  },

  /**
   * Construir URL para preview/download
   * path_cifrado viene como: uploads/documentos/xxx.pdf
   */
getDocumentoUrl: (pathCifrado) => {
    if (!pathCifrado) {
      console.warn('⚠️ pathCifrado está vacío');
      return null;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Si path empieza con /, no agregar otro
    const path = pathCifrado.startsWith('/') ? pathCifrado : `/${pathCifrado}`;
    
    const url = `${baseUrl}${path}`;
    
    console.log('🔗 URL construida:', url);
    console.log('   - baseUrl:', baseUrl);
    console.log('   - pathCifrado:', pathCifrado);
    console.log('   - path final:', path);
    
    return url;
  }
};