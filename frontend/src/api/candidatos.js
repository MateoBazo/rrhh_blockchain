import axios from './axios';

export const candidatosAPI = {
  getAll: async (filters = {}) => {
    const response = await axios.get('/candidatos', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/candidatos/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/candidatos/${id}`, data);
    return response.data;
  },

  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append('cv', file);
    const response = await axios.post('/upload/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('foto', file);
    const response = await axios.post('/upload/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};