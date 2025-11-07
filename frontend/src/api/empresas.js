import axiosInstance from './axios';

export const empresasAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/empresas');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/empresas/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/empresas/${id}`, data);
    return response.data;
  },
};