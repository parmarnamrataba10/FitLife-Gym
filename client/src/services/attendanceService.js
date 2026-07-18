import api from './api'

export const attendanceService = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  getToday: () => api.get('/attendance/today'),
  delete: (id) => api.delete(`/attendance/${id}`),
}
