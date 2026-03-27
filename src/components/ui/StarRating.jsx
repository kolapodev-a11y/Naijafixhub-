import React from 'react'
import { FiStar } from 'react-icons/fi'
import { FaStar, FaStarHalfAlt } from 'react-icons/fa'

export function StarDisplay({ rating = 0, size = 14, showValue = true, reviewCount }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: full }).map((_, i) => (
          <FaStar key={`f${i}`} size={size} className="text-yellow-400" />
        ))}
        {half && <FaStarHalfAlt size={size} className="text-yellow-400" />}
        {Array.from({ length: empty }).map((_, i) => (
          <FiStar key={`e${i}`} size={size} className="text-gray-300" />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700">{Number(rating).toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-400">({reviewCount})</span>
      )}
    </div>
  )
}

export function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <FaStar
            size={24}
            className={star <= value ? 'text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  )
}
