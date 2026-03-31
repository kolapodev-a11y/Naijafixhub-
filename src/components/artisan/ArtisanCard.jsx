import React from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiShield, FiStar, FiMessageCircle } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'
import { StarDisplay } from '../ui/StarRating'
import { formatPrice, truncate, generateWhatsAppLink, resolveAssetUrl, timeAgo } from '../../utils/helpers'
import { CATEGORIES } from '../../utils/constants'

export default function ArtisanCard({ artisan }) {
  const category = CATEGORIES.find(c => c.id === artisan.category)
  const waLink = generateWhatsAppLink(
    artisan.whatsapp || artisan.phone || '',
    `Hi, I found your profile on NaijaFixHub. Are you available for ${artisan.title}?`
  )

  return (
    <div className="card overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100">
        {artisan.photos?.[0] ? (
          <img
            src={resolveAssetUrl(artisan.photos[0])}
            alt={artisan.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{category?.icon || '🔧'}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {artisan.isPremium && (
            <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow">
              <FaCrown size={10} /> TOP ARTISAN
            </span>
          )}
          {artisan.status === 'approved' && (
            <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              <FiShield size={10} /> Verified
            </span>
          )}
        </div>

        {/* Category chip */}
        <div className="absolute top-3 right-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow"
            style={{ backgroundColor: category?.color || '#7C3AED' }}
          >
            {category?.name || artisan.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-base leading-snug mb-1 line-clamp-1">
          {artisan.title}
        </h3>
        <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
          <FiMapPin size={11} className="flex-shrink-0" />
          <span className="truncate">{artisan.location}</span>
        </p>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {truncate(artisan.description, 90)}
        </p>

        <div className="flex items-center justify-between mb-4">
          <StarDisplay rating={artisan.rating || 0} reviewCount={artisan.reviewCount || 0} size={12} />
          <span className="text-primary-700 font-bold text-sm">
            {formatPrice(artisan.startingPrice)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/artisan/${artisan._id}`}
            className="flex-1 text-center border border-primary-200 text-primary-700 hover:bg-primary-50 text-sm font-medium py-2 rounded-xl transition-colors"
          >
            View Profile
          </Link>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <FiMessageCircle size={14} />
            Chat
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">
        Listed {timeAgo(artisan.createdAt)}
      </div>
    </div>
  )
}
