import axios from 'axios'
import { safeGetItem } from '../utils/localStorageHelper'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const user = safeGetItem('currentUser')
  if (user) {
    config.headers.Authorization = `Bearer mock-token`
  }
  return config
})

export default api
