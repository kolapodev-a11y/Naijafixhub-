import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArtisanCard from '../components/artisan/ArtisanCard'
import { SkeletonCard } from '../components/ui/LoadingSpinner'
import { artisanAPI } from '../utils/api'
import { CATEGORIES, FEATURED_STATES, SORT_OPTIONS } from '../utils/constants'
import { FiSearch, FiFilter, FiX, FiSliders } from 'react-icons/fi'
import StateFilter from '../components/home/StateFilter'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All States')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState('newest')
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const LIMIT = 12

  const fetchArtisans = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        q: query || undefined,
        state: selectedState !== 'All States' ? selectedState : undefined,
        category: selectedCategory || undefined,
        sort: sortBy,
        page,
        limit: LIMIT,
        status: 'approved',
      }
      const { data } = await artisanAPI.getAll(params)
      setArtisans(data.artisans || [])
      setTotal(data.total || 0)
    } catch {
      setArtisans([])
    } finally {
      setLoading(false)
    }
  }, [query, selectedState, selectedCategory, sortBy, page])

  useEffect(() => { fetchArtisans() }, [fetchArtisans])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchParams({ q: query, state: selectedState, category: selectedCategory })
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedState('All States')
    setSelectedCategory('')
    setSortBy('newest')
    setPage(1)
  }

  const hasFilters = query || selectedState !== 'All States' || selectedCategory

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          <FiSearch size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search: "Plumber Lagos", "Electrician Abuja"...'
            className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <FiX size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary px-5">Search</button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-colors ${showFilters ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
        >
          <FiSliders size={16} /> Filters {hasFilters && <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>}
        </button>
      </form>

      {/* State Filter */}
      <div className="mb-4">
        <StateFilter selected={selectedState} onSelect={(s) => { setSelectedState(s); setPage(1) }} />
      </div>

      {/* Category + Sort row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          <button
            onClick={() => { setSelectedCategory(''); setPage(1) }}
            className={`chip flex-shrink-0 ${!selectedCategory ? 'chip-active' : 'chip-inactive'}`}
          >
            All
          </button>
          {CATEGORIES.slice(0, 8).map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id === selectedCategory ? '' : cat.id); setPage(1) }}
              className={`chip flex-shrink-0 ${selectedCategory === cat.id ? 'chip-active' : 'chip-inactive'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {hasFilters && (
            <button onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
              <FiX size={12} /> Clear
            </button>
          )}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white text-gray-700"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-600 text-sm">
          {loading ? 'Searching...' : (
            <span>
              <strong className="text-gray-800">{total}</strong> artisan{total !== 1 ? 's' : ''} found
              {selectedState !== 'All States' && <span> in <strong>{selectedState}</strong></span>}
              {selectedCategory && <span className="ml-1">• {CATEGORIES.find(c=>c.id===selectedCategory)?.name}</span>}
            </span>
          )}
        </p>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : artisans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No artisans found</h3>
          <p className="text-gray-400 mb-5">Try different keywords or clear filters</p>
          <button onClick={clearFilters} className="btn-outline text-sm">Clear all filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {artisans.map(a => <ArtisanCard key={a._id} artisan={a} />)}
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(total / LIMIT)}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * LIMIT >= total}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
