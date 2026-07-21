// Service API — Axios configuré pour le backend Spring Boot
import axios from 'axios'

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
const API_URL = `${BACKEND_URL}/api`

// Transforme une URL relative du backend (ex: /uploads/covers/x.jpg)
// en URL absolue ; laisse les URLs http(s) intactes
export const resolveFileUrl = (url) =>
  url && url.startsWith('/') ? BACKEND_URL + url : url

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Intercepteur — ajoute le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur — gère l'expiration du token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default api
