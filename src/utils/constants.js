export const NIGERIAN_STATES = [
  'All States', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi',
  'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi',
  'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

export const FEATURED_STATES = [
  'All States', 'Lagos', 'FCT Abuja', 'Rivers', 'Kano', 'Ondo',
  'Oyo', 'Edo', 'Enugu', 'Delta', 'Anambra', 'Kaduna'
]

export const CATEGORIES = [
  { id: 'plumbers', name: 'Plumbers', icon: '🔧', color: '#3B82F6' },
  { id: 'electricians', name: 'Electricians', icon: '⚡', color: '#F59E0B' },
  { id: 'ac-fridge-repair', name: 'AC & Fridge Repair', icon: '❄️', color: '#06B6D4' },
  { id: 'tailors-fashion', name: 'Tailors & Fashion', icon: '🧵', color: '#EC4899' },
  { id: 'carpenters', name: 'Carpenters & Furniture', icon: '🪑', color: '#92400E' },
  { id: 'house-cleaning', name: 'House Cleaning', icon: '🧹', color: '#10B981' },
  { id: 'painters', name: 'Painters', icon: '🎨', color: '#8B5CF6' },
  { id: 'generator-repair', name: 'Generator Repair', icon: '⚙️', color: '#6B7280' },
  { id: 'home-tutors', name: 'Home Tutors', icon: '📚', color: '#F97316' },
  { id: 'software-developer', name: 'Software Developer', icon: '💻', color: '#7C3AED' },
  { id: 'graphics-design', name: 'Graphics Design', icon: '🖌️', color: '#C026D3' },
  { id: 'seo-optimization', name: 'SEO Optimization', icon: '🔍', color: '#2563EB' },
  { id: 'mechanic', name: 'Mechanic', icon: '🚗', color: '#DC2626' },
  { id: 'welders', name: 'Welders', icon: '🔥', color: '#EA580C' },
  { id: 'mason-tilers', name: 'Mason & Tilers', icon: '🧱', color: '#78716C' },
  { id: 'security', name: 'Security Services', icon: '🛡️', color: '#1D4ED8' },
  { id: 'event-photography', name: 'Event Photography', icon: '📸', color: '#7C3AED' },
  { id: 'moving-logistics', name: 'Moving & Logistics', icon: '🚚', color: '#059669' },
  { id: 'beauty-makeup', name: 'Beauty & Makeup', icon: '💄', color: '#DB2777' },
  { id: 'others', name: 'Others', icon: '🔨', color: '#4B5563' },
]

// More categories can be added here
export const EXTRA_CATEGORIES = [
  { id: 'roofing', name: 'Roofers', icon: '🏠', color: '#92400E' },
  { id: 'pest-control', name: 'Pest Control', icon: '🐛', color: '#15803D' },
  { id: 'solar-installation', name: 'Solar Installation', icon: '☀️', color: '#CA8A04' },
  { id: 'cctv-installation', name: 'CCTV Installation', icon: '📹', color: '#1F2937' },
  { id: 'laundry', name: 'Laundry Services', icon: '👔', color: '#2563EB' },
  { id: 'catering', name: 'Catering Services', icon: '🍽️', color: '#B45309' },
  { id: 'landscaping', name: 'Landscaping', icon: '🌿', color: '#166534' },
  { id: 'web-design', name: 'Web Design', icon: '🌐', color: '#7C3AED' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'lowest-price', label: 'Lowest Price' },
  { value: 'nearest', label: 'Nearest' },
]

export const URGENCY_OPTIONS = [
  { value: 'immediately', label: 'Immediately (Today)' },
  { value: 'within-24h', label: 'Within 24 Hours' },
  { value: 'this-week', label: 'This Week' },
  { value: 'flexible', label: 'Flexible / Planning Ahead' },
]

export const SCAM_KEYWORDS = [
  'send money first', 'gift card', 'advance fee', 'western union',
  'money transfer first', 'pay upfront via transfer', 'recharge card',
  'send airtime', 'agent fee', 'registration fee', 'processing fee'
]

export const ADMIN_EMAIL = 'peezutech@gmail.com'
export const ADMIN_NAME = 'PeezuTech'
export const SUPPORT_EMAIL = 'peezutech@gmail.com'
export const PLATFORM_NAME = 'NaijaFixHub'
export const PREMIUM_PRICE = 5000 // ₦5000/month

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
