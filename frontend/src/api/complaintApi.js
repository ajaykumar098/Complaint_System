import api from './axiosInstance'

export const complaintApi = {
  submit: (data) => api.post('/complaints', data),
  getAll: () => api.get('/complaints'),
  getById: (id) => api.get(`/complaints/${id}`),
  getMine: () => api.get('/complaints/mine'),
}
