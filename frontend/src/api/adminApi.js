import api from './axiosInstance'

export const adminApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  getDashboard: () => api.get('/admin/dashboard'),
  getAllComplaints: () => api.get('/admin/complaints'),
}
