import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authAPI, artisanAPI } from '../utils/api'
import { getInitials, formatPrice, formatDate, resolveAssetUrl, timeAgo } from '../utils/helpers'
import { CATEGORIES, NIGERIAN_STATES } from '../utils/constants'
import Modal from '../components/ui/Modal'
import { FiUser, FiMail, FiSave, FiLock, FiTrash2, FiEdit3, FiPhone, FiShield, FiBriefcase, FiLogOut, FiImage, FiUpload, FiX } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'

const accountOptions = [
  { value: 'customer', title: 'Customer', subtitle: 'Find artisans and post requests' },
  { value: 'provider', title: 'Provider', subtitle: 'Offer services and manage listings' },
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

export default function ProfilePage() {
  const { user, updateUser, logout, canOfferServices, hasPremiumProvider } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [services, setServices] = useState([])
  const [editingService, setEditingService] = useState(null)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)
  const [serviceSaving, setServiceSaving] = useState(false)
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
  }, [user])

  const accountType = profileForm.watch('accountType')
  const accountDescription = useMemo(() => accountOptions.find((option) => option.value === accountType)?.subtitle, [accountType])

  const onProfileSubmit = async (values) => {
    setLoading(true)
    try {
      const res = await authAPI.updateProfile({ name: values.name, phone: values.phone, accountType: values.accountType })
      updateUser(res.data.user)
      toast.success('Profile updated!')
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
    const confirmed = window.confirm('This will permanently delete your account and listings. Continue?')
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
      toast.success('Service updated with your photo changes and resubmitted for review')
      resetServiceEditor()
      loadServices()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service')
    } finally {
      setServiceSaving(false)
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="card p-6 h-fit">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">{getInitials(user?.name)}</div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${user?.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>{user?.role === 'admin' ? 'Admin' : 'Member'}</span>
                <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase">{user?.accountType}</span>
                {hasPremiumProvider && <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800"><FaCrown size={10} /> Premium</span>}
              </div>
            </div>
          </div>

          {hasPremiumProvider && (
            <div className="mb-6 rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 text-sm text-yellow-900">
              <div className="flex items-center gap-2 font-semibold mb-1"><FaCrown className="text-yellow-500" /> Premium provider active</div>
              <p>All your current and future listings receive premium placement automatically.</p>
              {user?.premiumExpiresAt && <p className="mt-2 text-xs font-medium text-yellow-800">Active until {formatDate(user.premiumExpiresAt)}</p>}
            </div>
          )}

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2"><FiMail className="text-gray-400" /> {user?.email}</div>
            <div className="flex items-center gap-2"><FiPhone className="text-gray-400" /> {user?.phone || 'No phone added yet'}</div>
            <div className="flex items-center gap-2"><FiBriefcase className="text-gray-400" /> {accountDescription}</div>
          </div>

          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <FiLogOut size={15} /> Log Out
          </button>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4"><FiUser className="text-primary-600" /> <h2 className="text-lg font-bold text-gray-800">Profile information</h2></div>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Full name</label>
                  <input {...profileForm.register('name', { required: 'Name required' })} className="input-field" placeholder="Your full name" />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input {...profileForm.register('email')} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="label">Phone number</label>
                <input {...profileForm.register('phone')} className="input-field" placeholder="08012345678" />
              </div>

              {user?.role !== 'admin' && (
                <div>
                  <label className="label">Account type</label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {accountOptions.map((option) => (
                      <button key={option.value} type="button" onClick={() => profileForm.setValue('accountType', option.value)} className={`rounded-2xl border p-4 text-left transition ${accountType === option.value ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100' : 'border-gray-200 hover:border-primary-200'}`}>
                        <p className="text-sm font-bold text-gray-800">{option.title}</p>
                        <p className="mt-1 text-xs text-gray-500 leading-5">{option.subtitle}</p>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">You can switch this later if your needs change.</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">{loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={15} />} Save Changes</button>
            </form>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4"><FiLock className="text-primary-600" /> <h2 className="text-lg font-bold text-gray-800">Security</h2></div>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="grid gap-4 md:grid-cols-3">
              <input type="password" {...passwordForm.register('currentPassword')} className="input-field" placeholder="Current password" />
              <input type="password" {...passwordForm.register('newPassword')} className="input-field" placeholder="New password" />
              <input type="password" {...passwordForm.register('confirmPassword')} className="input-field" placeholder="Confirm new password" />
              <div className="md:col-span-3">
                <button type="submit" disabled={passwordLoading} className="btn-outline inline-flex items-center gap-2">{passwordLoading ? <span className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" /> : <FiShield size={15} />} Update Password</button>
              </div>
            </form>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">My services</h2>
                <p className="text-sm text-gray-500">View, edit text, and manage listing photos professionally.</p>
              </div>
              {canOfferServices && <button onClick={loadServices} className="btn-outline text-sm">Refresh</button>}
            </div>

            {!canOfferServices ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Switch your account type to Provider or Both if you want to create and manage service listings.</div>
            ) : servicesLoading ? (
              <p className="text-sm text-gray-500">Loading services…</p>
            ) : services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-500">You have not posted any services yet.</p>
                <button onClick={() => navigate('/post-service')} className="btn-primary mt-4">Post a Service</button>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service._id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-1 gap-4">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-primary-50 border border-primary-100">
                          {service.photos?.[0] ? (
                            <img src={resolveAssetUrl(service.photos[0])} alt={service.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-primary-500">
                              <FiImage size={26} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800">{service.title}</h3>
                            <span className={service.status === 'approved' ? 'badge-verified' : service.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>{service.status}</span>
                            {service.isPremium && <span className="badge-premium inline-flex items-center gap-1"><FaCrown size={10} /> Premium</span>}
                          </div>
                          <p className="text-sm text-gray-500">{CATEGORIES.find((item) => item.id === service.category)?.name || service.category} • {service.location}</p>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{service.description}</p>
                          <p className="mt-2 text-sm font-semibold text-primary-700">{formatPrice(service.startingPrice)}</p>
                          {service.rejectionReason && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">Rejection reason: {service.rejectionReason}</p>}
                          <p className="mt-2 text-xs text-gray-400">Updated {timeAgo(service.updatedAt || service.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditService(service)} className="btn-outline inline-flex items-center gap-2 text-sm"><FiEdit3 size={14} /> Edit</button>
                        <button onClick={() => deleteService(service._id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><FiTrash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6 border border-red-100">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Danger zone</h2>
            <p className="text-sm text-gray-500 mb-4">Delete your account and all related data permanently.</p>
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
                    <img src={resolveAssetUrl(photo)} alt={`Existing service ${index + 1}`} className="h-28 w-full object-cover" />
                    {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Cover</span>}
                    <button type="button" onClick={() => removeExistingServicePhoto(photo)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-600 shadow hover:bg-white">
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                {newServicePhotos.map((photo, index) => (
                  <div key={photo.preview} className="relative overflow-hidden rounded-2xl border border-primary-200 bg-primary-50">
                    <img src={photo.preview} alt={`New service ${index + 1}`} className="h-28 w-full object-cover" />
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
            <button onClick={resetServiceEditor} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
            <button onClick={saveService} disabled={serviceSaving} className="flex-1 btn-primary">{serviceSaving ? 'Saving...' : 'Save Service'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
