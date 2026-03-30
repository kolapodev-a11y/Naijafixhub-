import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { adminAPI } from '../utils/api'
import { formatPrice, timeAgo } from '../utils/helpers'
import { CATEGORIES } from '../utils/constants'
import Modal from '../components/ui/Modal'
import { PageLoader } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { FiCheck, FiX, FiFlag, FiUsers, FiList, FiRefreshCw, FiShield, FiBell, FiSearch } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'

const TABS = ['Pending', 'Reports', 'All Listings', 'Users']

const accountTypeLabel = {
  customer: 'Customer',
  provider: 'Provider',
  both: 'Both',
}

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth()
  const { setPendingCount } = useApp()
  const [activeTab, setActiveTab] = useState('Pending')
  const [stats, setStats] = useState({ pending: 0, reports: 0, total: 0, users: 0 })
  const [data, setData] = useState({ pending: [], reports: [], listings: [], users: [] })
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, pendingRes, reportsRes, listingsRes, usersRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingListings({ limit: 50 }),
        adminAPI.getReports(),
        adminAPI.getAllListings({ limit: 100 }),
        adminAPI.getAllUsers({ limit: 100 }),
      ])

      const nextStats = {
        pending: statsRes.data.pending || 0,
        reports: statsRes.data.reports || 0,
        total: statsRes.data.total || 0,
        users: statsRes.data.users || 0,
      }

      setStats(nextStats)
      setPendingCount(nextStats.pending)
      setData({
        pending: pendingRes.data.listings || [],
        reports: reportsRes.data.reports || [],
        listings: listingsRes.data.listings || [],
        users: usersRes.data.users || [],
      })
    } catch {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [setPendingCount])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveArtisan(id)
      toast.success('Listing approved and published!')
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed')
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    try {
      await adminAPI.rejectArtisan(rejectModal, rejectReason)
      toast.success('Listing rejected.')
      setRejectModal(null)
      setRejectReason('')
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed')
    }
  }

  const handleResolveReport = async (id, action) => {
    try {
      await adminAPI.resolveReport(id, action)
      toast.success(`Report ${action === 'ban' ? 'acted upon' : 'dismissed'}`)
      fetchAll()
    } catch {
      toast.error('Failed to resolve report')
    }
  }

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return data.listings
    return data.listings.filter((listing) => [listing.title, listing.location, listing.category, listing.user?.name, listing.user?.email].filter(Boolean).some((value) => value.toLowerCase().includes(q)))
  }, [data.listings, searchQuery])

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return data.users
    return data.users.filter((entry) => [entry.name, entry.email, entry.accountType].filter(Boolean).some((value) => value.toLowerCase().includes(q)))
  }, [data.users, searchQuery])

  if (authLoading) return <PageLoader />
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}><Icon size={22} className="text-white" /></div>
      <div>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2"><FiShield className="text-primary-600" /> Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Moderate listings, review reports, and manage users.</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="btn-ghost flex items-center gap-1.5 border border-gray-200 text-sm"><FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiBell} label="Pending Review" value={stats.pending || 0} color="bg-orange-500" />
        <StatCard icon={FiFlag} label="Open Reports" value={stats.reports || 0} color="bg-red-500" />
        <StatCard icon={FiList} label="Total Listings" value={stats.total || 0} color="bg-primary-600" />
        <StatCard icon={FiUsers} label="Total Users" value={stats.users || 0} color="bg-green-500" />
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
            {tab === 'Pending' && stats.pending > 0 && <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5">{stats.pending}</span>}
            {tab === 'Reports' && stats.reports > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5">{stats.reports}</span>}
          </button>
        ))}
      </div>

      {(activeTab === 'All Listings' || activeTab === 'Users') && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 relative">
            <FiSearch size={16} className="absolute left-3 top-3 text-gray-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-9 text-sm py-2.5" placeholder={`Search ${activeTab === 'Users' ? 'users' : 'listings'}...`} />
          </div>
        </div>
      )}

      {activeTab === 'Pending' && (
        <div>
          {loading ? (
            <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" /></div>
          ) : data.pending.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200"><p className="text-4xl mb-3">✅</p><p className="text-gray-500 font-medium">All caught up! No pending listings.</p></div>
          ) : (
            <div className="space-y-4">
              {data.pending.map((listing) => {
                const cat = CATEGORIES.find((c) => c.id === listing.category)
                return (
                  <div key={listing._id} className="card p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {listing.photos?.[0] ? <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">{cat?.icon || '🔧'}</div>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800 truncate">{listing.title}</h3>
                          <span className="badge-pending">Pending</span>
                          {listing.isPremium && <span className="badge-premium flex items-center gap-1"><FaCrown size={10} /> Premium</span>}
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{listing.location} • {cat?.name}</p>
                        <p className="text-xs text-gray-400">By: {listing.user?.name} ({listing.user?.email}) • {timeAgo(listing.createdAt)}</p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
                        <p className="text-primary-700 font-semibold text-sm mt-1">{formatPrice(listing.startingPrice)}</p>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => handleApprove(listing._id)} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"><FiCheck size={14} /> Approve</button>
                        <button onClick={() => setRejectModal(listing._id)} className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"><FiX size={14} /> Reject</button>
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
          {data.reports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200"><p className="text-4xl mb-3">🛡️</p><p className="text-gray-500 font-medium">No pending reports.</p></div>
          ) : (
            data.reports.filter((report) => report.status !== 'resolved').map((report) => (
              <div key={report._id} className="card p-5 border-l-4 border-red-400">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 flex items-center gap-2"><FiFlag className="text-red-500" size={15} /> Report on: <span className="text-primary-600">{report.artisan?.title || 'Unknown Service'}</span></p>
                    <p className="text-sm text-gray-600 mt-1">Reason: {report.reason}</p>
                    {report.details && <p className="text-xs text-gray-400 mt-0.5">{report.details}</p>}
                    <p className="text-xs text-gray-400 mt-1">Reported by: {report.reporter?.email || report.reporterEmail || 'Anonymous'} • {timeAgo(report.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleResolveReport(report._id, 'dismiss')} className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-xl transition-colors">Dismiss</button>
                    <button onClick={() => handleResolveReport(report._id, 'ban')} className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors">Take Action</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'All Listings' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Owner</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredListings.map((listing) => (
                <tr key={listing._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><p className="font-medium text-gray-800 line-clamp-1">{listing.title}</p><p className="text-xs text-gray-400">{listing.location}</p></td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{CATEGORIES.find((c) => c.id === listing.category)?.name || listing.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{listing.user?.name || '—'}</td>
                  <td className="px-4 py-3"><span className={listing.status === 'approved' ? 'badge-verified' : listing.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>{listing.status}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400">{formatPrice(listing.startingPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left">Account Type</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((entry) => (
                <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><p className="font-medium text-gray-800">{entry.name}</p><p className="text-xs text-gray-400">{entry.role === 'admin' ? 'Admin' : 'User'}</p></td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{entry.email}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{accountTypeLabel[entry.accountType] || entry.accountType}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400">{timeAgo(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="❌ Reject Listing">
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Please provide a reason for rejecting this listing. The provider will be notified in-app.</p>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="input-field resize-none" placeholder="e.g. Photo is unclear, missing service details, misleading description..." />
          <div className="flex gap-3">
            <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
            <button onClick={handleReject} className="flex-1 btn-danger">Confirm Rejection</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
