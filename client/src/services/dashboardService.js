import api from './api'

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getChartData: () => api.get('/dashboard/charts'),
}
