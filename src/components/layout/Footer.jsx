import React from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiGlobe, FiHeart } from 'react-icons/fi'
import { FaWhatsapp, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'
import { CATEGORIES } from '../../utils/constants'

const TOP_CATEGORY_IDS = [
  'plumbers',
  'electricians',
  'ac-fridge-repair',
  'tailors-fashion',
  'house-cleaning',
  'software-developer',
]

export default function Footer() {
  const topCategories = TOP_CATEGORY_IDS
    .map((categoryId) => CATEGORIES.find((category) => category.id === categoryId))
    .filter(Boolean)

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="bg-amber-500/10 border-t border-amber-500/30 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-amber-200 text-sm font-medium">
            ⚠️ <strong>Safety Notice:</strong> Payments & deals happen directly between you and the artisan (WhatsApp, bank transfer, cash).
            NaijaFixHub does not hold funds — <strong>verify before paying.</strong>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NF</span>
              </div>
              <span className="text-white font-extrabold text-lg">NaijaFixHub</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Find trusted local artisans & home service providers in Nigeria – fast & safe.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors p-1">
                <FaTwitter size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors p-1">
                <FaFacebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors p-1">
                <FaInstagram size={18} />
              </a>
              <a href="https://wa.me/234" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-green-400 transition-colors p-1">
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/search', label: 'Browse Services' },
                { to: '/post-service', label: 'Offer a Service' },
                { to: '/request', label: 'Post a Job Request' },
                { to: '/register', label: 'Join as Artisan' },
              ].map((linkItem) => (
                <li key={linkItem.to}>
                  <Link to={linkItem.to} className="text-gray-400 hover:text-primary-300 text-sm transition-colors">
                    {linkItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Top Categories</h3>
            <ul className="space-y-2.5">
              {topCategories.map((category) => (
                <li key={category.id}>
                  <Link to={`/search?category=${category.id}`} className="text-gray-400 hover:text-primary-300 text-sm transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Safety & Contact</h3>
            <div className="space-y-3 mb-5">
              <a href="mailto:peezutech@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-primary-300 text-sm transition-colors">
                <FiMail size={14} /> peezutech@gmail.com
              </a>
              <a href="https://peezutech.name.ng" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-primary-300 text-sm transition-colors">
                <FiGlobe size={14} /> peezutech.name.ng
              </a>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-400 mb-1.5">🔐 Safety Tips</p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>✓ Check reviews & photos</li>
                <li>✓ Meet in public if possible</li>
                <li>✓ Never pay advance fees</li>
                <li>✓ Report issues via email</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} NaijaFixHub. Built with <FiHeart className="inline text-red-500" size={12} /> by{' '}
            <a href="https://peezutech.name.ng" target="_blank" rel="noreferrer" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
              PeezuTech
            </a>
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
