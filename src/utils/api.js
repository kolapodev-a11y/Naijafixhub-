import axios from 'axios'
import { API_BASE_URL } from './constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('naijafixhub_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('naijafixhub_token')
      localStorage.removeItem('naijafixhub_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  deleteProfile: () => api.delete('/auth/profile'),
}

export const artisanAPI = {
  getAll: (params) => api.get('/artisans', { params }),
  getById: (id) => api.get(`/artisans/${id}`),
  create: (data) =>
    api.post('/artisans', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) =>
    api.put(`/artisans/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/artisans/${id}`),
  getFeatured: () => api.get('/artisans/featured'),
  getMyListings: () => api.get('/artisans/my-listings'),
  addReview: (id, data) => api.post(`/artisans/${id}/reviews`, data),
  getReviews: (id) => api.get(`/artisans/${id}/reviews`),
}

export const requestAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  getMine: () => api.get('/requests/mine'),
}

export const reportAPI = {
  submit: (data) => api.post('/reports', data),
}

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getPendingListings: (params) => api.get('/admin/pending', { params }),
  approveArtisan: (id) => api.put(`/admin/artisans/${id}/approve`),
  rejectArtisan: (id, reason) => api.put(`/admin/artisans/${id}/reject`, { reason }),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (id, action) => api.put(`/admin/reports/${id}/resolve`, { action }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (id, reason) => api.put(`/admin/users/${id}/suspend`, { reason }),
  getAllListings: (params) => api.get('/admin/listings', { params }),
}

export const paymentAPI = {
  initiatePremium: () => api.post('/payments/initiate'),
  verifyPayment: (reference) => api.get(`/payments/verify/${reference}`),
}

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}

export default api
