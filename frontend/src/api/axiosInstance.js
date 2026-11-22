import axios from 'axios'
import { safeGetItem } from '../utils/localStorageHelper'

import { API_BASE } from './config'

const api = axios.create({
  baseURL: API_BASE,
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
