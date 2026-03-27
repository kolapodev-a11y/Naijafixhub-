import axios from 'axios'
import { API_BASE_URL } from './constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor – attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('naijafixhub_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('naijafixhub_token')
      localStorage.removeItem('naijafixhub_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── AUTH ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (token) => api.post('/auth/google', { token }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
}

// ── ARTISANS / SERVICES ───────────────────────────────────
export const artisanAPI = {
  getAll: (params) => api.get('/artisans', { params }),
  getById: (id) => api.get(`/artisans/${id}`),
  create: (data) => api.post('/artisans', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/artisans/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/artisans/${id}`),
  getFeatured: () => api.get('/artisans/featured'),
  getMyListings: () => api.get('/artisans/my-listings'),
  addReview: (id, data) => api.post(`/artisans/${id}/reviews`, data),
  getReviews: (id) => api.get(`/artisans/${id}/reviews`),
}

// ── JOB REQUESTS ─────────────────────────────────────────
export const requestAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  getMine: () => api.get('/requests/mine'),
}

// ── REPORTS ──────────────────────────────────────────────
export const reportAPI = {
  submit: (data) => api.post('/reports', data),
}

// ── ADMIN ────────────────────────────────────────────────
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getPendingListings: (params) => api.get('/admin/pending', { params }),
  approveArtisan: (id) => api.put(`/admin/artisans/${id}/approve`),
  rejectArtisan: (id, reason) => api.put(`/admin/artisans/${id}/reject`, { reason }),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (id, action) => api.put(`/admin/reports/${id}/resolve`, { action }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (id) => api.put(`/admin/users/${id}/suspend`),
  getAllListings: (params) => api.get('/admin/listings', { params }),
}

// ── PAYMENTS ─────────────────────────────────────────────
export const paymentAPI = {
  initiatePremium: (artisanId) => api.post('/payments/initiate', { artisanId }),
  verifyPayment: (reference) => api.get(`/payments/verify/${reference}`),
}

export default api
