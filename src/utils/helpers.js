import { API_BASE_URL, SCAM_KEYWORDS } from './constants'

export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Price on request'
  return `₦${Number(price).toLocaleString('en-NG')}`
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export const timeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export const containsScamKeywords = (text) => {
  if (!text) return false
  const lower = text.toLowerCase()
  return SCAM_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))
}

export const normalizePhoneNumber = (phone) => {
  const cleaned = String(phone || '').replace(/\D/g, '')
  if (!cleaned) return ''

  if (cleaned.startsWith('234')) return `+${cleaned}`
  if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`
  return `+234${cleaned}`
}

export const generateWhatsAppLink = (phone, message = '') => {
  const normalized = normalizePhoneNumber(phone).replace(/\D/g, '')
  if (!normalized) return '#'
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalized}?text=${encoded}`
}

export const generateCallLink = (phone) => {
  const normalized = normalizePhoneNumber(phone)
  return normalized ? `tel:${normalized}` : '#'
}

export const generateSmsLink = (phone, message = '') => {
  const normalized = normalizePhoneNumber(phone)
  if (!normalized) return '#'
  const encoded = encodeURIComponent(message)
  return `sms:${normalized}?body=${encoded}`
}

export const truncate = (str, n = 120) => {
  if (!str) return ''
  return str.length > n ? `${str.slice(0, n)}…` : str
}

export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.replace(/\b\w/g, (c) => c.toUpperCase())
}

export const renderStars = (rating) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return { full, half, empty }
}

export const getInitials = (name) => {
  if (!name) return '??'
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0'])

const getBackendAssetBaseUrl = () => API_BASE_URL.replace(/\/api\/?$/, '')

export const resolveAssetUrl = (assetUrl) => {
  if (!assetUrl || typeof assetUrl !== 'string') return ''

  const value = assetUrl.trim()
  if (!value) return ''

  if (
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    if (!value.startsWith('http')) return value

    try {
      const parsed = new URL(value)
      if (LOCAL_HOSTS.has(parsed.hostname)) {
        const backendBaseUrl = getBackendAssetBaseUrl()
        return `${backendBaseUrl}${parsed.pathname}${parsed.search}${parsed.hash}`
      }
    } catch {
      return value
    }

    return value
  }

  const backendBaseUrl = getBackendAssetBaseUrl()

  if (value.startsWith('/')) {
    return `${backendBaseUrl}${value}`
  }

  return `${backendBaseUrl}/${value.replace(/^\.?\//, '')}`
}

export const isAdmin = (user) => {
  return user?.role === 'admin' || user?.email === 'peezutech@gmail.com'
}
