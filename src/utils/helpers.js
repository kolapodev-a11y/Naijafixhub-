import { SCAM_KEYWORDS } from './constants'

export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Price on request'
  return `₦${Number(price).toLocaleString('en-NG')}`
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric'
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
  return SCAM_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()))
}

export const generateWhatsAppLink = (phone, message = '') => {
  const cleaned = phone.replace(/\D/g, '')
  const international = cleaned.startsWith('0')
    ? `234${cleaned.slice(1)}`
    : cleaned.startsWith('234')
      ? cleaned
      : `234${cleaned}`
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${international}?text=${encoded}`
}

export const truncate = (str, n = 120) => {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.replace(/\b\w/g, c => c.toUpperCase())
}

export const renderStars = (rating) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return { full, half, empty }
}

export const getInitials = (name) => {
  if (!name) return '??'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export const isAdmin = (user) => {
  return user?.role === 'admin' || user?.email === 'peezutech@gmail.com'
}
