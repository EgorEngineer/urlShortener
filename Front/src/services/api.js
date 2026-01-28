import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auth API
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Ошибка при входе'
  }
}

export const registerUser = async (email, username, password) => {
  try {
    const response = await api.post('/auth/register', { email, username, password })
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Ошибка при регистрации'
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me')
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Ошибка при получении данных пользователя'
  }
}

// Links API
export const createShortLink = async (originalUrl) => {
  try {
    const response = await api.post('/links', { originalUrl })
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Ошибка при создании короткой ссылки'
  }
}

export const getLinkDetails = async (code) => {
  try {
    const response = await api.get(`/links/${code}`)
    return response.data
  } catch (error) {
    throw error.response?.data || 'Ошибка при получении информации о ссылке'
  }
}

export const getMyLinks = async () => {
  try {
    const response = await api.get('/links/my-links')
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Ошибка при получении списка ссылок'
  }
}

export const getQRCode = (code) => {
  return `${API_BASE_URL}/links/${code}/qr`
}

export default api

