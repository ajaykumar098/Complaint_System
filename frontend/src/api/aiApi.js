import api from './axiosInstance'

export const aiApi = {
  ask: (prompt) => api.post('/ai/ask', { prompt }),
}
