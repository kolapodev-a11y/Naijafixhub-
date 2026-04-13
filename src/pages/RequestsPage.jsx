import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiAlertTriangle, FiClock, FiMapPin, FiMessageSquare, FiPhone, FiSearch } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { requestAPI } from '../utils/api'
import { CATEGORIES, URGENCY_OPTIONS } from '../utils/constants'
import { generateCallLink, generateSmsLink, generateWhatsAppLink, timeAgo } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const LIMIT = 12

export default function RequestsPage() {
  const { loading: authLoading, isAuthenticated, canOfferServices, canRequestServices } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const fetchRequests = async () => {
    if (!isAuthenticated || !canOfferServices) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data } = await requestAPI.getAll({
        page,
        limit: LIMIT,
        q: query || undefined,
        category: selectedCategory || undefined,
      })
      setRequests(data.requests || [])
      setTotal(data.total || 0)
    } catch (error) {
      setRequests([])
      setTotal(0)
      toast.error(error.response?.data?.message || 'Could not load customer requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [isAuthenticated, canOfferServices, page, query, selectedCategory])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total])

  if (authLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-gray-500">Loading requests…</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="card p-8 text-center">
          <p className="mb-4 text-5xl">🔐</p>
          <h1 className="mb-3 text-2xl font-extrabold text-gray-800">Sign in to browse customer requests</h1>
          <p className="mb-6 text-sm text-gray-500">Providers use this page to discover open jobs and contact customers directly.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/login?redirect=/requests" className="btn-primary text-center">Sign In</Link>
            <Link to="/register?redirect=/requests" className="btn-outline text-center">Create Account</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!canOfferServices) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="card p-8 text-center">
          <p className="mb-4 text-5xl">🛠️</p>
          <h1 className="mb-3 text-2xl font-extrabold text-gray-800">Browse requests is for providers</h1>
          <p className="mb-6 text-sm text-gray-500">Customer accounts focus on browsing service listings and posting requests. Switch your account type to Provider or Both if you want to respond to customer jobs.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/search" className="btn-outline text-center">Browse Services</Link>
            <Link to="/profile" className="btn-primary text-center">Update Account Type</Link>
            {canRequestServices && <Link to="/" className="btn-ghost border border-gray-200 text-center">Post a Request</Link>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Browse Customer Requests</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">Open requests are shown to providers so they can contact customers quickly by WhatsApp, phone call, or SMS.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <strong>Safety reminder:</strong> Verify the customer details and agree payment terms clearly before starting any work.
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-3xl bg-white p-4 shadow-card md:grid-cols-[1fr,220px]">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3">
          <FiSearch className="text-gray-400" size={18} />
          <input
            value={query}
            onChange={(event) => {
              setPage(1)
              setQuery(event.target.value)
            }}
            placeholder="Search by request, location, or keyword"
            className="w-full bg-transparent text-sm text-gray-700 outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(event) => {
            setPage(1)
            setSelectedCategory(event.target.value)
          }}
          className="input-field"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>{category.icon} {category.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-sm text-gray-500 shadow-card">Loading customer requests…</div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="mb-3 text-5xl">📭</p>
          <h2 className="text-xl font-bold text-gray-800">No open requests found</h2>
          <p className="mt-2 text-sm text-gray-500">Try another keyword or category. New requests will appear here automatically.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500">
            Showing <strong className="text-gray-800">{requests.length}</strong> of <strong className="text-gray-800">{total}</strong> open request{total === 1 ? '' : 's'}.
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {requests.map((request) => {
              const requestCategory = CATEGORIES.find((item) => item.id === request.category)
              const urgencyLabel = URGENCY_OPTIONS.find((item) => item.value === request.urgency)?.label || request.urgency
              const contactNumber = request.whatsapp || request.user?.phone || ''
              const whatsappLink = generateWhatsAppLink(contactNumber, `Hello, I saw your request on NaijaFixHub: "${request.description}". I can help.`)
              const callLink = generateCallLink(contactNumber)
              const smsLink = generateSmsLink(contactNumber, `Hello, I saw your request on NaijaFixHub and I can help.`)

              return (
                <div key={request._id} className="card p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                          {requestCategory ? `${requestCategory.icon} ${requestCategory.name}` : 'Customer Request'}
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{urgencyLabel}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{request.user?.name || 'Customer'}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><FiMapPin size={12} /> {request.location}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><FiClock size={12} /> {timeAgo(request.createdAt)}</span>
                  </div>

                  <p className="mb-4 text-sm leading-6 text-gray-700">{request.description}</p>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-600">
                      <FaWhatsapp size={16} /> Chat on WhatsApp
                    </a>
                    <a href={callLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50">
                      <FiPhone size={15} /> Call
                    </a>
                    <a href={smsLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                      <FiMessageSquare size={15} /> Send Message
                    </a>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <FiAlertTriangle className="mt-0.5 flex-shrink-0" />
                    <span>Never ask for advance payment without proper verification. Keep communication clear and professional.</span>
                  </div>
                </div>
              )
            })}
          </div>

          {total > LIMIT && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-40"
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
