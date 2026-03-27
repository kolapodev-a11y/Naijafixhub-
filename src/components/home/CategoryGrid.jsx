import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../../utils/constants'

export default function CategoryGrid({ counts = {} }) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => navigate(`/search?category=${cat.id}`)}
          className="group bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-card-hover border border-transparent hover:border-primary-200 transition-all duration-200 hover:-translate-y-1 active:scale-95"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2.5 text-2xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${cat.color}18` }}
          >
            {cat.icon}
          </div>
          <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 transition-colors leading-tight mb-1">
            {cat.name}
          </p>
          {counts[cat.id] !== undefined && (
            <p className="text-xs text-gray-400">{counts[cat.id]} listing{counts[cat.id] !== 1 ? 's' : ''}</p>
          )}
        </button>
      ))}
    </div>
  )
}
