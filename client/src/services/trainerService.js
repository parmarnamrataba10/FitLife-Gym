import api from './api'

export const trainerService = {
  getAll: (params) => api.get('/trainers', { params }),
  getById: (id) => api.get(`/trainers/${id}`),
  create: (data) => api.post('/trainers', data),
  update: (id, data) => api.put(`/trainers/${id}`, data),
  delete: (id) => api.delete(`/trainers/${id}`),
}
