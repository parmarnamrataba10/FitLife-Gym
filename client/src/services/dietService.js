import api from './api'

export const dietService = {
  getAll: (params) => api.get('/diets', { params }),
  getById: (id) => api.get(`/diets/${id}`),
  create: (data) => api.post('/diets', data),
  update: (id, data) => api.put(`/diets/${id}`, data),
  delete: (id) => api.delete(`/diets/${id}`),
  assign: (id, data) => api.put(`/diets/${id}/assign`, data),
}
