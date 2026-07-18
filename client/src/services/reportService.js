import api from './api'

export const reportService = {
  getMembers: (params) => api.get('/reports/members', { params }),
  getPayments: (params) => api.get('/reports/payments', { params }),
  getAttendance: (params) => api.get('/reports/attendance', { params }),
  getRevenue: (params) => api.get('/reports/revenue', { params }),
  getMembership: (params) => api.get('/reports/membership', { params }),
}
