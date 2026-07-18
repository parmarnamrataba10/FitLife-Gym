import api from './api'

export const memberService = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  toggleStatus: (id) => api.put(`/members/${id}/status`),
  assignTrainer: (id, data) => api.put(`/members/${id}/assign-trainer`, data),
}
