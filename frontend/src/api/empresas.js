import axios from './axios';

export const empresasAPI = {
  getAll: async () => {
    const response = await axios.get('/empresas');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/empresas/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/empresas/${id}`, data);
    return response.data;
  },
};