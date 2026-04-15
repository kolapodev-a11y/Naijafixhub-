import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArtisanCard from '../components/artisan/ArtisanCard'
import { SkeletonCard } from '../components/ui/LoadingSpinner'
import { artisanAPI } from '../utils/api'
import { CATEGORIES, SORT_OPTIONS } from '../utils/constants'
import { readCache, writeCache } from '../utils/cache'
import { FiSearch, FiX, FiSliders } from 'react-icons/fi'
import StateFilter from '../components/home/StateFilter'

const LIMIT = 12
const SEARCH_RESULTS_TTL_MS = 5 * 60 * 1000
const buildSearchCacheKey = (params) => `naijafixhub_search:${JSON.stringify(params)}`

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchKey = searchParams.toString()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All States')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const cacheDescriptor = useMemo(
    () => ({
      q: query || '',
      state: selectedState !== 'All States' ? selectedState : '',
      category: selectedCategory || '',
      sort: sortBy,
      page,
      limit: LIMIT,
      status: 'approved',
    }),
    [page, query, selectedCategory, selectedState, sortBy],
  )

  const cachedPayload = useMemo(
    () => readCache(buildSearchCacheKey(cacheDescriptor), SEARCH_RESULTS_TTL_MS),
    [cacheDescriptor],
  )

  const [artisans, setArtisans] = useState(cachedPayload?.artisans || [])
  const [total, setTotal] = useState(cachedPayload?.total || 0)
  const [loading, setLoading] = useState(!cachedPayload)

  useEffect(() => {
    const nextQuery = searchParams.get('q') || ''
    const nextState = searchParams.get('state') || 'All States'
    const nextCategory = searchParams.get('category') || ''

    setQuery(nextQuery)
    setSelectedState(nextState)
    setSelectedCategory(nextCategory)
    setPage(1)
  }, [searchKey, searchParams])

  useEffect(() => {
    if (!cachedPayload) return
    setArtisans(cachedPayload.artisans || [])
    setTotal(cachedPayload.total || 0)
    setLoading(false)
  }, [cachedPayload])

  const buildSearchParamPayload = useCallback((nextQuery, nextState, nextCategory) => {
    const params = {}

    if (nextQuery?.trim()) params.q = nextQuery.trim()
    if (nextState && nextState !== 'All States') params.state = nextState
    if (nextCategory) params.category = nextCategory

    return params
  }, [])

  const applyFilters = useCallback((nextValues = {}) => {
    const nextQuery = nextValues.query ?? query
    const nextState = nextValues.state ?? selectedState
    const nextCategory = nextValues.category ?? selectedCategory

    setQuery(nextQuery)
    setSelectedState(nextState)
    setSelectedCategory(nextCategory)
    setPage(1)
    setSearchParams(buildSearchParamPayload(nextQuery, nextState, nextCategory))
  }, [buildSearchParamPayload, query, selectedCategory, selectedState, setSearchParams])

  const fetchArtisans = useCallback(async () => {
    const cacheKey = buildSearchCacheKey(cacheDescriptor)
    const cached = readCache(cacheKey, SEARCH_RESULTS_TTL_MS)

    if (cached) {
      setArtisans(cached.artisans || [])
      setTotal(cached.total || 0)
      setLoading(false)
    } else {
      setLoading(true)
    }

    try {
      const { data } = await artisanAPI.getAll({
        ...cacheDescriptor,
        q: cacheDescriptor.q || undefined,
        state: cacheDescriptor.state || undefined,
        category: cacheDescriptor.category || undefined,
      })

      const nextPayload = {
        artisans: data.artisans || [],
        total: data.total || 0,
      }

      setArtisans(nextPayload.artisans)
      setTotal(nextPayload.total)
      writeCache(cacheKey, nextPayload)
    } catch {
      if (!cached) {
        setArtisans([])
        setTotal(0)
      }
    } finally {
      setLoading(false)
    }
  }, [cacheDescriptor])

  useEffect(() => {
    fetchArtisans()
  }, [fetchArtisans])

  const handleSearch = (event) => {
    event.preventDefault()
    applyFilters({ query })
  }

  const clearFilters = () => {
    setSortBy('newest')
    setPage(1)
    setSearchParams({})
    setQuery('')
    setSelectedState('All States')
    setSelectedCategory('')
  }

  const totalPages = useMemo(() => Math.ceil(total / LIMIT), [total])
  const hasFilters = Boolean(query || selectedState !== 'All States' || selectedCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          <FiSearch size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
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

      <div className="mb-4">
        <StateFilter selected={selectedState} onSelect={(stateName) => applyFilters({ state: stateName })} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          <button
            onClick={() => applyFilters({ category: '' })}
            className={`chip flex-shrink-0 ${!selectedCategory ? 'chip-active' : 'chip-inactive'}`}
          >
            All
          </button>
          {CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => applyFilters({ category: cat.id === selectedCategory ? '' : cat.id })}
              className={`chip flex-shrink-0 ${selectedCategory === cat.id ? 'chip-active' : 'chip-inactive'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
              <FiX size={12} /> Clear
            </button>
          )}
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white text-gray-700"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-600 text-sm">
          {loading ? 'Searching...' : (
            <span>
              <strong className="text-gray-800">{total}</strong> artisan{total !== 1 ? 's' : ''} found
              {selectedState !== 'All States' && <span> in <strong>{selectedState}</strong></span>}
              {selectedCategory && <span className="ml-1">• {CATEGORIES.find((category) => category.id === selectedCategory)?.name}</span>}
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: LIMIT }).map((_, index) => <SkeletonCard key={index} />)}
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
            {artisans.map((artisan) => <ArtisanCard key={artisan._id} artisan={artisan} />)}
          </div>

          {total > LIMIT && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((currentPage) => currentPage + 1)}
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
