import api from './api'

export const workoutService = {
  getAll: (params) => api.get('/workouts', { params }),
  getById: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  assign: (id, data) => api.put(`/workouts/${id}/assign`, data),
}
