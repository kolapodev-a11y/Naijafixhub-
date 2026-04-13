import React, { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { adminAPI } from '../utils/api'
import { formatPrice, resolveAssetUrl, timeAgo } from '../utils/helpers'
import { CATEGORIES } from '../utils/constants'
import Modal from '../components/ui/Modal'
import { PageLoader } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  FiCheck,
  FiX,
  FiFlag,
  FiUsers,
  FiList,
  FiRefreshCw,
  FiEye,
  FiShield,
  FiBell,
  FiSearch,
  FiMapPin,
  FiPhone,
  FiMessageCircle,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'

const TABS = ['Pending', 'Reports', 'All Listings', 'Users']

function SectionLoader() {
  return (
    <div className="py-14 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  )
}

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth()
  const { setPendingCount } = useApp()

  const [activeTab, setActiveTab] = useState('Pending')
  const [dashboardData, setDashboardData] = useState({ pending: [], reports: [], listings: [], users: [] })
  const [stats, setStats] = useState({ pending: 0, reports: 0, total: 0, users: 0 })
  const [bootLoading, setBootLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingListing, setViewingListing] = useState(null)
  const [viewingImageIndex, setViewingImageIndex] = useState(0)
  const [actionId, setActionId] = useState('')

  const loadDashboard = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setBootLoading(true)
    }

    try {
      const [statsRes, pendingRes, reportsRes, listingsRes, usersRes] = await Promise.allSettled([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingListings(),
        adminAPI.getReports(),
        adminAPI.getAllListings(),
        adminAPI.getAllUsers(),
      ])

      let hadFailure = false

      if (statsRes.status === 'fulfilled') {
        const nextStats = statsRes.value.data
        setStats(nextStats)
        setPendingCount(nextStats.pending || 0)
      } else {
        hadFailure = true
      }

      setDashboardData((prev) => ({
        pending: pendingRes.status === 'fulfilled' ? pendingRes.value.data.listings || [] : prev.pending,
        reports: reportsRes.status === 'fulfilled' ? reportsRes.value.data.reports || [] : prev.reports,
        listings: listingsRes.status === 'fulfilled' ? listingsRes.value.data.listings || [] : prev.listings,
        users: usersRes.status === 'fulfilled' ? usersRes.value.data.users || [] : prev.users,
      }))

      if (pendingRes.status === 'rejected' || reportsRes.status === 'rejected' || listingsRes.status === 'rejected' || usersRes.status === 'rejected') {
        hadFailure = true
      }

      if (hadFailure) {
        toast.error('Some admin data could not be refreshed. Showing the latest available results.')
      }
    } catch (error) {
      toast.error('Failed to load admin data')
    } finally {
      setBootLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return dashboardData.listings
    return dashboardData.listings.filter((listing) => {
      const categoryName = CATEGORIES.find((item) => item.id === listing.category)?.name || listing.category || ''
      return [listing.title, listing.location, listing.state, listing.user?.name, listing.user?.email, categoryName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [dashboardData.listings, searchQuery])

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return dashboardData.users
    return dashboardData.users.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [dashboardData.users, searchQuery])

  const openListingViewer = (listing) => {
    setViewingListing(listing)
    setViewingImageIndex(0)
  }

  const closeListingViewer = () => {
    setViewingListing(null)
    setViewingImageIndex(0)
  }

  const viewingPhotos = viewingListing?.photos || []
  const hasMultipleViewingPhotos = viewingPhotos.length > 1

  const showPreviousViewingPhoto = () => {
    if (!hasMultipleViewingPhotos) return
    setViewingImageIndex((currentIndex) => (currentIndex === 0 ? viewingPhotos.length - 1 : currentIndex - 1))
  }

  const showNextViewingPhoto = () => {
    if (!hasMultipleViewingPhotos) return
    setViewingImageIndex((currentIndex) => (currentIndex === viewingPhotos.length - 1 ? 0 : currentIndex + 1))
  }

  const handleApprove = async (id) => {
    setActionId(id)
    try {
      await adminAPI.approveArtisan(id)
      toast.success('Listing approved and published.')
      await loadDashboard({ silent: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed')
    } finally {
      setActionId('')
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setActionId(rejectModal?._id || 'rejecting')
    try {
      await adminAPI.rejectArtisan(rejectModal._id, rejectReason)
      toast.success('Listing rejected.')
      setRejectModal(null)
      setRejectReason('')
      await loadDashboard({ silent: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed')
    } finally {
      setActionId('')
    }
  }

  const handleResolveReport = async (id, action) => {
    setActionId(id)
    try {
      await adminAPI.resolveReport(id, action)
      toast.success(`Report ${action === 'ban' ? 'resolved with action' : 'dismissed'}`)
      await loadDashboard({ silent: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resolve report')
    } finally {
      setActionId('')
    }
  }

  if (authLoading) return <PageLoader />
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  )

  const StatusBadge = ({ status }) => (
    <span className={status === 'approved' ? 'badge-verified' : status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>
      {status}
    </span>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <FiShield className="text-primary-600" /> Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review, approve, reject, and inspect submitted service listings without the loading loop.</p>
        </div>
        <button
          onClick={() => loadDashboard({ silent: true })}
          disabled={refreshing}
          className="btn-ghost flex items-center gap-1.5 border border-gray-200 text-sm self-start sm:self-auto"
        >
          <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiBell} label="Pending Review" value={stats.pending || 0} color="bg-orange-500" />
        <StatCard icon={FiFlag} label="Open Reports" value={stats.reports || 0} color="bg-red-500" />
        <StatCard icon={FiList} label="Total Listings" value={stats.total || 0} color="bg-primary-600" />
        <StatCard icon={FiUsers} label="Total Users" value={stats.users || 0} color="bg-green-500" />
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              setSearchQuery('')
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
            {tab === 'Pending' && stats.pending > 0 && <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5">{stats.pending}</span>}
            {tab === 'Reports' && stats.reports > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5">{stats.reports}</span>}
          </button>
        ))}
      </div>

      {bootLoading ? (
        <SectionLoader />
      ) : (
        <>
          {activeTab === 'Pending' && (
            <div>
              {dashboardData.pending.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-gray-500 font-medium">All caught up. No pending listings.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.pending.map((listing) => {
                    const category = CATEGORIES.find((item) => item.id === listing.category)
                    return (
                      <div key={listing._id} className="card p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {listing.photos?.[0] ? (
                              <img src={resolveAssetUrl(listing.photos[0])} alt={listing.title} className="h-full w-full object-contain bg-white p-1.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">{category?.icon || '🔧'}</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-800 truncate">{listing.title}</h3>
                              <span className="badge-pending">Pending</span>
                              {listing.isPremium && <span className="badge-premium flex items-center gap-1"><FaCrown size={10} /> Premium</span>}
                            </div>
                            <p className="text-sm text-gray-500 mb-1">{listing.location}, {listing.state} • {category?.name || listing.category}</p>
                            <p className="text-xs text-gray-400">By: {listing.user?.name} ({listing.user?.email}) • {timeAgo(listing.createdAt)}</p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
                            <p className="text-primary-700 font-semibold text-sm mt-1">{formatPrice(listing.startingPrice)}</p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-3 lg:w-[340px]">
                            <button
                              onClick={() => openListingViewer(listing)}
                              className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                            >
                              <FiEye size={14} /> View
                            </button>
                            <button
                              onClick={() => handleApprove(listing._id)}
                              disabled={actionId === listing._id}
                              className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-70 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                            >
                              <FiCheck size={14} /> Approve
                            </button>
                            <button
                              onClick={() => setRejectModal(listing)}
                              className="flex items-center justify-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                            >
                              <FiX size={14} /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Reports' && (
            <div className="space-y-4">
              {dashboardData.reports.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-4xl mb-3">🛡️</p>
                  <p className="text-gray-500 font-medium">No pending reports.</p>
                </div>
              ) : (
                dashboardData.reports
                  .filter((report) => report.status !== 'resolved')
                  .map((report) => (
                    <div key={report._id} className="card p-5 border-l-4 border-red-400">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 flex items-center gap-2">
                            <FiFlag className="text-red-500" size={15} />
                            Report on: <span className="text-primary-600">{report.artisan?.title || 'Unknown listing'}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">Reason: {report.reason}</p>
                          {report.details && <p className="text-xs text-gray-400 mt-0.5">{report.details}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            Reported by: {report.reporter?.email || report.reporterEmail || 'Anonymous'} • {timeAgo(report.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleResolveReport(report._id, 'dismiss')}
                            disabled={actionId === report._id}
                            className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-xl transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleResolveReport(report._id, 'ban')}
                            disabled={actionId === report._id}
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-70 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
                          >
                            Take Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'All Listings' && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex-1 relative">
                  <FiSearch size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-9 text-sm py-2.5" placeholder="Search listings..." />
                </div>
              </div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left">Title</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Location</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Posted</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredListings.length === 0 ? (
                        <tr>
                          <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>No listings found.</td>
                        </tr>
                      ) : (
                        filteredListings.map((listing) => (
                          <tr key={listing._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800 line-clamp-1">{listing.title}</p>
                              <p className="text-xs text-gray-400">{listing.user?.name || 'Unknown owner'}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{CATEGORIES.find((item) => item.id === listing.category)?.name || listing.category}</td>
                            <td className="px-4 py-3 text-gray-500">{listing.location}, {listing.state}</td>
                            <td className="px-4 py-3"><StatusBadge status={listing.status} /></td>
                            <td className="px-4 py-3 text-gray-400">{timeAgo(listing.createdAt)}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => openListingViewer(listing)} className="text-primary-700 hover:text-primary-800 font-medium inline-flex items-center gap-1">
                                <FiEye size={14} /> View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Users' && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex-1 relative">
                  <FiSearch size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-9 text-sm py-2.5" placeholder="Search users..." />
                </div>
              </div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[680px]">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>No users found.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                            <td className="px-4 py-3 text-gray-500">{user.email}</td>
                            <td className="px-4 py-3 text-gray-500 capitalize">{user.role}</td>
                            <td className="px-4 py-3">
                              {user.isSuspended ? <span className="badge-rejected">Suspended</span> : <span className="badge-verified">Active</span>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title="❌ Reject Listing">
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Please provide a reason for rejecting this listing. The artisan will be notified.</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="e.g. Profile photo is unclear or description contains misleading information..."
          />
          <div className="flex gap-3">
            <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
            <button onClick={handleReject} className="flex-1 btn-danger" disabled={actionId === rejectModal?._id}>
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!viewingListing} onClose={closeListingViewer} title="👀 Listing Details" size="xl">
        {viewingListing && (
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                <div className="relative h-64 bg-white sm:h-80">
                  {viewingPhotos[viewingImageIndex] ? (
                    <img src={resolveAssetUrl(viewingPhotos[viewingImageIndex])} alt={`${viewingListing.title} ${viewingImageIndex + 1}`} className="h-full w-full object-contain p-3" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      {CATEGORIES.find((item) => item.id === viewingListing.category)?.icon || '🔧'}
                    </div>
                  )}

                  {viewingPhotos.length > 0 && (
                    <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow">
                      {viewingImageIndex + 1} / {viewingPhotos.length}
                    </div>
                  )}

                  {hasMultipleViewingPhotos && (
                    <>
                      <button onClick={showPreviousViewingPhoto} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:bg-white">
                        <FiChevronLeft size={18} />
                      </button>
                      <button onClick={showNextViewingPhoto} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:bg-white">
                        <FiChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {hasMultipleViewingPhotos && (
                  <div className="flex gap-2 overflow-x-auto border-t border-gray-100 bg-white p-3 scrollbar-hide">
                    {viewingPhotos.map((photo, index) => (
                      <button key={`${photo}-${index}`} onClick={() => setViewingImageIndex(index)} className={`flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-white transition-all ${viewingImageIndex === index ? 'border-primary-500 shadow-sm' : 'border-gray-200 hover:border-primary-200'}`}>
                        <img src={resolveAssetUrl(photo)} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-contain p-1.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">{viewingListing.title}</h3>
                <StatusBadge status={viewingListing.status} />
                {viewingListing.isPremium && <span className="badge-premium flex items-center gap-1"><FaCrown size={10} /> Premium</span>}
              </div>
              <p className="text-sm text-gray-500">Owned by {viewingListing.user?.name || 'Unknown'} • {viewingListing.user?.email || 'No email'}</p>
              <p className="text-sm font-semibold text-primary-700">{formatPrice(viewingListing.startingPrice)}</p>
              <p className="text-sm text-gray-600">{viewingListing.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-2">Location</p>
                <p className="flex items-center gap-2"><FiMapPin /> {viewingListing.location}, {viewingListing.state}</p>
                {viewingListing.serviceArea && <p className="mt-2 text-gray-500">Service area: {viewingListing.serviceArea}</p>}
              </div>
              <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-2">Contact</p>
                <p className="flex items-center gap-2"><FiMessageCircle /> {viewingListing.whatsapp || 'No WhatsApp number'}</p>
                <p className="mt-2 flex items-center gap-2"><FiPhone /> {viewingListing.phone || 'No alternative phone'}</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              Posted {timeAgo(viewingListing.createdAt)} • Category: {CATEGORIES.find((item) => item.id === viewingListing.category)?.name || viewingListing.category}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
