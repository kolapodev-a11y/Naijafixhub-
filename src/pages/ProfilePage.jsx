import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authAPI, artisanAPI, requestAPI } from '../utils/api'
import { formatDate, formatPrice, getInitials, resolveAssetUrl, timeAgo } from '../utils/helpers'
import { CATEGORIES, NIGERIAN_STATES, URGENCY_OPTIONS } from '../utils/constants'
import Modal from '../components/ui/Modal'
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiImage,
  FiLock,
  FiMail,
  FiMapPin,
  FiPauseCircle,
  FiPhone,
  FiSave,
  FiShield,
  FiTrash2,
  FiUpload,
  FiUser,
  FiX,
} from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'

const accountOptions = [
  { value: 'customer', title: 'Customer', subtitle: 'Browse service listings and post requests for artisans' },
  { value: 'provider', title: 'Provider', subtitle: 'Browse customer requests and manage service listings' },
  { value: 'both', title: 'Both', subtitle: 'Use customer and provider features together' },
]

const emptyServiceForm = {
  title: '',
  category: '',
  description: '',
  state: '',
  location: '',
  serviceArea: '',
  startingPrice: '',
  priceLabel: '',
  whatsapp: '',
  phone: '',
}

const requestStatusTone = {
  open: 'bg-emerald-50 text-emerald-700',
  fulfilled: 'bg-blue-50 text-blue-700',
  expired: 'bg-gray-100 text-gray-600',
}

const serviceStatusTone = {
  active: 'bg-emerald-50 text-emerald-700',
  paused: 'bg-amber-50 text-amber-700',
  completed: 'bg-blue-50 text-blue-700',
}

export default function ProfilePage() {
  const { user, updateUser, logout, canOfferServices, canRequestServices, hasPremiumProvider, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [serviceSaving, setServiceSaving] = useState(false)
  const [services, setServices] = useState([])
  const [requests, setRequests] = useState([])
  const [editingService, setEditingService] = useState(null)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)
  const [existingServicePhotos, setExistingServicePhotos] = useState([])
  const [newServicePhotos, setNewServicePhotos] = useState([])
  const [servicePhotoError, setServicePhotoError] = useState('')

  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      accountType: user?.accountType || 'customer',
    },
  })

  const passwordForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const clearNewServicePhotos = () => {
    setNewServicePhotos((prev) => {
      prev.forEach((photo) => URL.revokeObjectURL(photo.preview))
      return []
    })
  }

  const resetServiceEditor = () => {
    clearNewServicePhotos()
    setEditingService(null)
    setServiceForm(emptyServiceForm)
    setExistingServicePhotos([])
    setServicePhotoError('')
  }

  const loadServices = async () => {
    if (!user) return
    setServicesLoading(true)
    try {
      const { data } = await artisanAPI.getMyListings()
      setServices(data.artisans || [])
    } catch {
      setServices([])
    } finally {
      setServicesLoading(false)
    }
  }

  const loadRequests = async () => {
    if (!user) return
    setRequestsLoading(true)
    try {
      const { data } = await requestAPI.getMine()
      setRequests(data.requests || [])
    } catch {
      setRequests([])
    } finally {
      setRequestsLoading(false)
    }
  }

  useEffect(() => {
    profileForm.reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      accountType: user?.accountType || 'customer',
    })
  }, [user, profileForm])

  useEffect(() => {
    loadServices()
    loadRequests()
  }, [user])

  const accountType = profileForm.watch('accountType')
  const accountDescription = useMemo(() => accountOptions.find((option) => option.value === accountType)?.subtitle, [accountType])
  const currentAccountDescription = useMemo(() => accountOptions.find((option) => option.value === user?.accountType)?.subtitle, [user?.accountType])
  const showRequestsSection = canRequestServices || requests.length > 0 || isAdmin
  const showServicesSection = canOfferServices || services.length > 0 || isAdmin

  const buildRoleSwitchMessage = (nextAccountType) => {
    const nextLabel = accountOptions.find((option) => option.value === nextAccountType)?.title || nextAccountType
    const lines = [
      `Switch account type to ${nextLabel}?`,
      '',
      'What changes:',
      '• Customer: browse service listings and post requests.',
      '• Provider: browse requests and manage service listings.',
      '• Both: access both workflows.',
    ]

    if (services.length > 0) {
      lines.push('', `• Your ${services.length} existing service listing(s) will stay saved in your account.`)
    }
    if (requests.length > 0) {
      lines.push(`• Your ${requests.length} existing request(s) will remain in your account history.`)
    }

    lines.push('', 'You can change this again later.')
    return lines.join('\n')
  }

  const onProfileSubmit = async (values) => {
    if (!isAdmin && values.accountType !== user?.accountType) {
      const confirmed = window.confirm(buildRoleSwitchMessage(values.accountType))
      if (!confirmed) return
    }

    setLoading(true)
    try {
      const res = await authAPI.updateProfile({
        name: values.name,
        phone: values.phone,
        accountType: values.accountType,
      })
      updateUser(res.data.user)
      toast.success(values.accountType !== user?.accountType ? 'Account type updated successfully.' : 'Profile updated!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await authAPI.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      updateUser(res.data.user)
      passwordForm.reset()
      toast.success('Password updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('This will permanently delete your account and all related listings/requests. Continue?')
    if (!confirmed) return

    try {
      await authAPI.deleteProfile()
      toast.success('Account deleted successfully')
      logout()
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    }
  }

  const openEditService = (service) => {
    clearNewServicePhotos()
    setEditingService(service)
    setExistingServicePhotos(service.photos || [])
    setServicePhotoError('')
    setServiceForm({
      title: service.title || '',
      category: service.category || '',
      description: service.description || '',
      state: service.state || '',
      location: service.location || '',
      serviceArea: service.serviceArea || '',
      startingPrice: service.startingPrice || '',
      priceLabel: service.priceLabel || '',
      whatsapp: service.whatsapp || '',
      phone: service.phone || '',
    })
  }

  const handleServicePhotoChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const invalidFile = files.find((file) => !file.type.startsWith('image/'))
    if (invalidFile) {
      setServicePhotoError('Only image files can be uploaded.')
      event.target.value = ''
      return
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024)
    if (oversizedFile) {
      setServicePhotoError('Each photo must be 5MB or less.')
      event.target.value = ''
      return
    }

    const totalPhotos = existingServicePhotos.length + newServicePhotos.length + files.length
    if (totalPhotos > 5) {
      setServicePhotoError('Maximum 5 photos allowed per service.')
      event.target.value = ''
      return
    }

    setServicePhotoError('')
    const preparedFiles = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setNewServicePhotos((prev) => [...prev, ...preparedFiles])
    event.target.value = ''
  }

  const removeExistingServicePhoto = (photoToRemove) => {
    setExistingServicePhotos((prev) => prev.filter((photo) => photo !== photoToRemove))
    setServicePhotoError('')
  }

  const removeNewServicePhoto = (indexToRemove) => {
    setNewServicePhotos((prev) => {
      const next = [...prev]
      const [removed] = next.splice(indexToRemove, 1)
      if (removed?.preview) URL.revokeObjectURL(removed.preview)
      return next
    })
    setServicePhotoError('')
  }

  const saveService = async () => {
    if (!editingService) return

    const totalPhotos = existingServicePhotos.length + newServicePhotos.length
    if (totalPhotos === 0) {
      setServicePhotoError('Keep at least one photo on your listing.')
      return
    }

    setServiceSaving(true)
    try {
      const fd = new FormData()
      Object.entries(serviceForm).forEach(([key, value]) => fd.append(key, value || ''))
      existingServicePhotos.forEach((photo) => fd.append('retainedPhotos', photo))
      newServicePhotos.forEach(({ file }) => fd.append('photos', file))
      await artisanAPI.update(editingService._id, fd)
      toast.success('Service updated and resubmitted for review.')
      resetServiceEditor()
      loadServices()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service')
    } finally {
      setServiceSaving(false)
    }
  }

  const updateServiceLifecycle = async (service, serviceStatus) => {
    const actionLabel = serviceStatus === 'active' ? 'reactivate' : serviceStatus
    const confirmed = window.confirm(`Are you sure you want to ${actionLabel} “${service.title}”?`)
    if (!confirmed) return

    try {
      await artisanAPI.updateServiceStatus(service._id, serviceStatus)
      toast.success(serviceStatus === 'active' ? 'Service reactivated.' : serviceStatus === 'completed' ? 'Service marked as completed.' : 'Service paused successfully.')
      loadServices()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service status')
    }
  }

  const deleteService = async (id) => {
    const confirmed = window.confirm('Delete this service listing?')
    if (!confirmed) return

    try {
      await artisanAPI.delete(id)
      toast.success('Service deleted')
      loadServices()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service')
    }
  }

  const updateRequestStatus = async (request, status) => {
    const actionText = status === 'fulfilled' ? 'mark this request as fulfilled' : status === 'expired' ? 'close this request as expired' : 'reopen this request'
    const confirmed = window.confirm(`Are you sure you want to ${actionText}?`)
    if (!confirmed) return

    try {
      await requestAPI.updateStatus(request._id, status)
      toast.success(status === 'open' ? 'Request reopened.' : status === 'fulfilled' ? 'Request marked as fulfilled.' : 'Request marked as expired.')
      loadRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request status')
    }
  }

  const deleteRequest = async (requestId) => {
    const confirmed = window.confirm('Delete this request permanently?')
    if (!confirmed) return

    try {
      await requestAPI.delete(requestId)
      toast.success('Request deleted successfully.')
      loadRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete request')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="card h-fit p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-xl font-bold text-white">
              {getInitials(user?.name)}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${isAdmin ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                  {isAdmin ? 'Admin' : 'Member'}
                </span>
                <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium uppercase text-emerald-700">
                  {user?.accountType}
                </span>
                {hasPremiumProvider && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                    <FaCrown size={10} /> {isAdmin ? 'Premium+' : 'Premium'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {hasPremiumProvider && (
            <div className="mb-6 rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 text-sm text-yellow-900">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <FaCrown className="text-yellow-500" />
                {isAdmin ? 'Unlimited Premium+ admin access' : 'Premium provider active'}
              </div>
              <p>
                {isAdmin
                  ? 'This admin profile always has Premium+ visibility and marketplace privileges without expiry.'
                  : 'All your current and future listings receive premium placement automatically while your plan is active.'}
              </p>
              {!isAdmin && user?.premiumExpiresAt && (
                <p className="mt-2 text-xs font-medium text-yellow-800">Active until {formatDate(user.premiumExpiresAt)}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-primary-50 p-3 text-center">
              <p className="text-lg font-bold text-primary-700">{services.length}</p>
              <p className="text-xs text-primary-700/80">Services</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-center">
              <p className="text-lg font-bold text-blue-700">{requests.length}</p>
              <p className="text-xs text-blue-700/80">Requests</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-center">
              <p className="text-sm font-bold uppercase text-emerald-700">{user?.accountType}</p>
              <p className="text-xs text-emerald-700/80">Access</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2"><FiMail className="text-gray-400" /> {user?.email}</div>
            <div className="flex items-center gap-2"><FiPhone className="text-gray-400" /> {user?.phone || 'No phone added yet'}</div>
            <div className="flex items-center gap-2"><FiBriefcase className="text-gray-400" /> {currentAccountDescription}</div>
          </div>

          <div className="mt-6 space-y-2">
            {canRequestServices && <button onClick={() => navigate('/')} className="btn-outline w-full text-sm">Post a Customer Request</button>}
            {canOfferServices && <button onClick={() => navigate('/post-service')} className="btn-primary w-full text-sm">Post a Service Listing</button>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2"><FiUser className="text-primary-600" /> <h2 className="text-lg font-bold text-gray-800">Profile information</h2></div>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Full name</label>
                  <input {...profileForm.register('name', { required: 'Name required' })} className="input-field" placeholder="Your full name" />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input {...profileForm.register('email')} disabled className="input-field cursor-not-allowed bg-gray-50 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="label">Phone number</label>
                <input {...profileForm.register('phone')} className="input-field" placeholder="08012345678" />
              </div>

              {!isAdmin && (
                <div>
                  <label className="label">Account type</label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {accountOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => profileForm.setValue('accountType', option.value)}
                        className={`rounded-2xl border p-4 text-left transition ${accountType === option.value ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100' : 'border-gray-200 hover:border-primary-200'}`}
                      >
                        <p className="text-sm font-bold text-gray-800">{option.title}</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">{option.subtitle}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                    Customers browse services and post requests. Providers browse requests and manage services. Both accounts get both workflows. You will be asked to confirm before switching.
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
                {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <FiSave size={15} />} Save Changes
              </button>
            </form>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2"><FiLock className="text-primary-600" /> <h2 className="text-lg font-bold text-gray-800">Security</h2></div>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="grid gap-4 md:grid-cols-3">
              <input type="password" {...passwordForm.register('currentPassword')} className="input-field" placeholder="Current password" />
              <input type="password" {...passwordForm.register('newPassword')} className="input-field" placeholder="New password" />
              <input type="password" {...passwordForm.register('confirmPassword')} className="input-field" placeholder="Confirm new password" />
              <div className="md:col-span-3">
                <button type="submit" disabled={passwordLoading} className="btn-outline inline-flex items-center gap-2">
                  {passwordLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" /> : <FiShield size={15} />} Update Password
                </button>
              </div>
            </form>
          </div>

          {showRequestsSection && (
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">My requests</h2>
                  <p className="text-sm text-gray-500">Track requests you posted and close them professionally when the job is done.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={loadRequests} className="btn-outline text-sm">Refresh</button>
                  {canRequestServices && <button onClick={() => navigate('/')} className="btn-primary text-sm">Post Request</button>}
                </div>
              </div>

              {requestsLoading ? (
                <p className="text-sm text-gray-500">Loading requests…</p>
              ) : requests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                  <p className="text-sm text-gray-500">You have not posted any requests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => {
                    const category = CATEGORIES.find((item) => item.id === request.category)
                    const urgencyLabel = URGENCY_OPTIONS.find((item) => item.value === request.urgency)?.label || request.urgency
                    return (
                      <div key={request._id} className="rounded-2xl border border-gray-100 p-4">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${requestStatusTone[request.status] || 'bg-gray-100 text-gray-600'}`}>{request.status}</span>
                              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{category ? `${category.icon} ${category.name}` : 'General request'}</span>
                              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{urgencyLabel}</span>
                            </div>
                            <p className="text-sm leading-6 text-gray-700">{request.description}</p>
                          </div>
                          <span className="text-xs text-gray-400">{timeAgo(request.createdAt)}</span>
                        </div>
                        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><FiMapPin size={14} /> {request.location}</span>
                          <span className="flex items-center gap-1"><FiPhone size={14} /> {request.whatsapp}</span>
                          <span className="flex items-center gap-1"><FiClock size={14} /> Expires {formatDate(request.expiresAt)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {request.status === 'open' ? (
                            <>
                              <button onClick={() => updateRequestStatus(request, 'fulfilled')} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                                <FiCheckCircle size={14} /> Mark Fulfilled
                              </button>
                              <button onClick={() => updateRequestStatus(request, 'expired')} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50">
                                <FiClock size={14} /> Close Request
                              </button>
                            </>
                          ) : (
                            <button onClick={() => updateRequestStatus(request, 'open')} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                              <FiCheckCircle size={14} /> Reopen Request
                            </button>
                          )}
                          <button onClick={() => deleteRequest(request._id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                            <FiTrash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {showServicesSection && (
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">My services</h2>
                  <p className="text-sm text-gray-500">Manage service listings, pause availability, or mark work as completed professionally.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={loadServices} className="btn-outline text-sm">Refresh</button>
                  {canOfferServices && <button onClick={() => navigate('/post-service')} className="btn-primary text-sm">Post Service</button>}
                </div>
              </div>

              {!canOfferServices && services.length > 0 && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Your current account type no longer opens the provider workflow by default, but your existing services remain available here for management.
                </div>
              )}

              {servicesLoading ? (
                <p className="text-sm text-gray-500">Loading services…</p>
              ) : services.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                  <p className="text-sm text-gray-500">You have not posted any services yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service._id} className="rounded-2xl border border-gray-100 p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex flex-1 gap-4">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-primary-100 bg-primary-50">
                            {service.photos?.[0] ? (
                              <img src={resolveAssetUrl(service.photos[0])} alt={service.title} className="h-full w-full bg-white p-2 object-contain" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-primary-500">
                                <FiImage size={26} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-gray-800">{service.title}</h3>
                              <span className={service.status === 'approved' ? 'badge-verified' : service.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>{service.status}</span>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${serviceStatusTone[service.serviceStatus || 'active'] || 'bg-gray-100 text-gray-600'}`}>{service.serviceStatus || 'active'}</span>
                              {service.isPremium && <span className="badge-premium inline-flex items-center gap-1"><FaCrown size={10} /> Premium</span>}
                            </div>
                            <p className="text-sm text-gray-500">{CATEGORIES.find((item) => item.id === service.category)?.name || service.category} • {service.location}</p>
                            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{service.description}</p>
                            <p className="mt-2 text-sm font-semibold text-primary-700">{formatPrice(service.startingPrice)}</p>
                            {service.rejectionReason && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">Rejection reason: {service.rejectionReason}</p>}
                            <p className="mt-2 text-xs text-gray-400">Updated {timeAgo(service.updatedAt || service.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:max-w-[220px] md:flex-col">
                          <button onClick={() => openEditService(service)} className="btn-outline inline-flex items-center gap-2 text-sm"><FiEdit3 size={14} /> Edit</button>
                          {service.serviceStatus !== 'completed' && (
                            <button onClick={() => updateServiceLifecycle(service, 'completed')} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><FiCheckCircle size={14} /> Mark Complete</button>
                          )}
                          {service.serviceStatus === 'active' ? (
                            <button onClick={() => updateServiceLifecycle(service, 'paused')} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"><FiPauseCircle size={14} /> Pause</button>
                          ) : (
                            <button onClick={() => updateServiceLifecycle(service, 'active')} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"><FiCheckCircle size={14} /> Reactivate</button>
                          )}
                          <button onClick={() => deleteService(service._id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><FiTrash2 size={14} /> Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card border border-red-100 p-6">
            <h2 className="mb-2 text-lg font-bold text-gray-800">Danger zone</h2>
            <p className="mb-4 text-sm text-gray-500">Delete your account and all related data permanently.</p>
            <button onClick={handleDeleteAccount} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"><FiTrash2 size={15} /> Delete Account</button>
          </div>
        </div>
      </div>

      <Modal isOpen={!!editingService} onClose={resetServiceEditor} title="Edit Service Listing">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="label">Listing photos</label>
                <p className="text-xs text-gray-500">Remove old photos, upload new ones, and keep up to 5 photos. The first photo becomes the cover image.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50">
                <FiUpload size={14} /> Add photos
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleServicePhotoChange} />
              </label>
            </div>
            {(existingServicePhotos.length > 0 || newServicePhotos.length > 0) && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {existingServicePhotos.map((photo, index) => (
                  <div key={photo} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <img src={resolveAssetUrl(photo)} alt={`Existing service ${index + 1}`} className="h-28 w-full bg-white p-2 object-contain" />
                    {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Cover</span>}
                    <button type="button" onClick={() => removeExistingServicePhoto(photo)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-600 shadow hover:bg-white">
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                {newServicePhotos.map((photo, index) => (
                  <div key={photo.preview} className="relative overflow-hidden rounded-2xl border border-primary-200 bg-primary-50">
                    <img src={photo.preview} alt={`New service ${index + 1}`} className="h-28 w-full bg-white p-2 object-contain" />
                    <span className="absolute left-2 top-2 rounded-full bg-primary-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">New</span>
                    <button type="button" onClick={() => removeNewServicePhoto(index)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-600 shadow hover:bg-white">
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {servicePhotoError && <p className="mt-2 text-xs text-red-500">{servicePhotoError}</p>}
          </div>

          <div>
            <label className="label">Title</label>
            <input value={serviceForm.title} onChange={(e) => setServiceForm((prev) => ({ ...prev, title: e.target.value }))} className="input-field" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <select value={serviceForm.category} onChange={(e) => setServiceForm((prev) => ({ ...prev, category: e.target.value }))} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.icon} {item.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">State</label>
              <select value={serviceForm.state} onChange={(e) => setServiceForm((prev) => ({ ...prev, state: e.target.value }))} className="input-field">
                <option value="">Select state</option>
                {NIGERIAN_STATES.filter((state) => state !== 'All States').map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Location</label>
              <input value={serviceForm.location} onChange={(e) => setServiceForm((prev) => ({ ...prev, location: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Service Area</label>
              <input value={serviceForm.serviceArea} onChange={(e) => setServiceForm((prev) => ({ ...prev, serviceArea: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={serviceForm.description} onChange={(e) => setServiceForm((prev) => ({ ...prev, description: e.target.value }))} rows={4} className="input-field resize-none" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Starting Price (₦)</label>
              <input type="number" value={serviceForm.startingPrice} onChange={(e) => setServiceForm((prev) => ({ ...prev, startingPrice: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Price Label</label>
              <input value={serviceForm.priceLabel} onChange={(e) => setServiceForm((prev) => ({ ...prev, priceLabel: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">WhatsApp</label>
              <input value={serviceForm.whatsapp} onChange={(e) => setServiceForm((prev) => ({ ...prev, whatsapp: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={serviceForm.phone} onChange={(e) => setServiceForm((prev) => ({ ...prev, phone: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">Editing a listing will resubmit it for admin review, including your picture updates.</div>
          <div className="flex gap-3">
            <button onClick={resetServiceEditor} className="btn-ghost flex-1 border border-gray-200">Cancel</button>
            <button onClick={saveService} disabled={serviceSaving} className="btn-primary flex-1">{serviceSaving ? 'Saving...' : 'Save Service'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
