import api from './axiosInstance'

export const chatApi = {
  sendMessage: (message) => api.post('/chat', { message }),
  getHistory: () => api.get('/chat/history'),
}
