import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { artisanAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, NIGERIAN_STATES } from '../utils/constants'
import { containsScamKeywords } from '../utils/helpers'
import toast from 'react-hot-toast'
import { FiUpload, FiCheck, FiAlertCircle, FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import { FaWhatsapp, FaCrown } from 'react-icons/fa'

const step1Schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
  location: z.string().min(3, 'Please enter your service area'),
  state: z.string().min(1, 'Please select your state'),
  startingPrice: z.string().min(1, 'Please enter a starting price'),
  priceLabel: z.string().optional(),
})

const step2Schema = z.object({
  whatsapp: z.string().min(7, 'WhatsApp number is required').max(20),
  phone: z.string().optional(),
})

const step3Schema = z.object({
  isPremium: z.boolean().optional(),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to terms' }) }),
})

const STEPS = ['Details', 'Contact', 'Safety & Submit']

export default function PostServicePage() {
  const { isAuthenticated, canOfferServices } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState([])
  const [photoError, setPhotoError] = useState('')
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const step1Form = useForm({ resolver: zodResolver(step1Schema) })
  const step2Form = useForm({ resolver: zodResolver(step2Schema) })
  const step3Form = useForm({ resolver: zodResolver(step3Schema) })

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + photos.length > 5) {
      setPhotoError('Maximum 5 photos allowed')
      return
    }
    setPhotoError('')
    setPhotos((prev) => [...prev, ...files])
  }

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx))

  const handleStep1 = step1Form.handleSubmit((data) => {
    if (containsScamKeywords(data.description)) {
      step1Form.setError('description', { message: 'Description contains suspicious keywords. Please revise.' })
      return
    }
    if (photos.length === 0) {
      setPhotoError('At least one photo is required')
      return
    }
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(2)
  })

  const handleStep2 = step2Form.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(3)
  })

  const handleStep3 = step3Form.handleSubmit(async (data) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to post a service')
      navigate('/login?redirect=/post-service')
      return
    }

    if (!canOfferServices) {
      toast.error('Your account type cannot offer services. Choose an artisan or both account to continue.')
      navigate('/profile')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      const payload = { ...formData, ...data }
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v)
      })
      photos.forEach((photo) => fd.append('photos', photo))

      await artisanAPI.create(fd)
      setSubmitted(true)
      toast.success('Service listed! Pending admin review.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post service. Try again.')
    } finally {
      setLoading(false)
    }
  })

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <p className="text-5xl mb-4">🔐</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Sign in to Post a Service</h2>
          <p className="text-gray-500 mb-6">Join NaijaFixHub to offer your services to thousands of clients across Nigeria.</p>
          <div className="flex flex-col gap-3">
            <Link to="/login?redirect=/post-service" className="btn-primary w-full text-center">Sign In</Link>
            <Link to="/register?redirect=/post-service" className="btn-outline w-full text-center">Create Account</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!canOfferServices) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <p className="text-5xl mb-4">🚫</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your account cannot offer services yet</h2>
          <p className="text-gray-500 mb-6">
            This page is available only to <strong>service providers</strong> and <strong>both-role</strong> accounts.
            If you need both capabilities, register with the both option.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/search" className="btn-outline w-full text-center">Browse Artisans</Link>
            <Link to="/profile" className="btn-primary w-full text-center">Go to My Profile</Link>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiCheck size={36} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Listed! 🎉</h2>
          <p className="text-gray-500 mb-5">
            Your listing is under review by our admin team. You will be notified once approved.
            <br /><br />
            <span className="text-amber-600 text-sm font-medium">
              ⚠️ Please note: NaijaFixHub does not handle payments. All transactions are directly between you and clients.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/" className="flex-1 btn-outline text-sm text-center">Go to Home</Link>
            <button
              onClick={() => {
                setSubmitted(false)
                setStep(1)
                setPhotos([])
                setFormData({})
              }}
              className="flex-1 btn-primary text-sm"
            >
              Post Another Service
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">Offer Your Service</h1>
        <p className="text-gray-500">Fill in your service details to connect with clients across Nigeria</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        {STEPS.map((label, idx) => {
          const num = idx + 1
          const done = step > num
          const active = step === num
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-brand-success text-white' : active ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-gray-200 text-gray-500'}`}>
                  {done ? <FiCheck size={16} /> : num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${active ? 'text-primary-700' : 'text-gray-400'}`}>{label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${step > num ? 'bg-brand-success' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1} className="card p-6 space-y-5">
          <h2 className="font-bold text-lg text-gray-800">Step 1: Service Details</h2>

          <div>
            <label className="label">Service Title <span className="text-red-500">*</span></label>
            <input {...step1Form.register('title')} className="input-field"
              placeholder='e.g. "Professional Plumbing Services in Lagos"' />
            {step1Form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Category <span className="text-red-500">*</span></label>
            <select {...step1Form.register('category')} className="input-field">
              <option value="">— Select Category —</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            {step1Form.formState.errors.category && <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.category.message}</p>}
          </div>

          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea {...step1Form.register('description')} rows={4} className="input-field resize-none"
              placeholder="Describe your services, experience, tools, and what makes you different..." />
            {step1Form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">State <span className="text-red-500">*</span></label>
              <select {...step1Form.register('state')} className="input-field">
                <option value="">— Select State —</option>
                {NIGERIAN_STATES.filter((s) => s !== 'All States').map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {step1Form.formState.errors.state && <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.state.message}</p>}
            </div>
            <div>
              <label className="label">Area / LGA <span className="text-red-500">*</span></label>
              <input {...step1Form.register('location')} className="input-field"
                placeholder="e.g. Victoria Island, Lagos" />
              {step1Form.formState.errors.location && <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.location.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Service Area (optional)</label>
            <input {...step1Form.register('serviceArea')} className="input-field"
              placeholder="e.g. Lagos Island, Lekki, Victoria Island, Ajah" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Starting Price (₦) <span className="text-red-500">*</span></label>
              <input {...step1Form.register('startingPrice')} type="number" min="0" className="input-field"
                placeholder="e.g. 5000" />
              {step1Form.formState.errors.startingPrice && <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.startingPrice.message}</p>}
            </div>
            <div>
              <label className="label">Price Label</label>
              <input {...step1Form.register('priceLabel')} className="input-field"
                placeholder="e.g. per visit, per hour" />
            </div>
          </div>

          <div>
            <label className="label">Photos (min 1, max 5) <span className="text-red-500">*</span></label>
            <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-colors ${photoError ? 'border-red-300' : 'border-gray-300'}`}>
              <input type="file" accept="image/*" multiple onChange={handlePhotoChange}
                className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <FiUpload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload photos (JPG, PNG, WebP)</p>
                <p className="text-xs text-gray-400 mt-1">Show before/after, tools, completed works</p>
              </label>
            </div>
            {photoError && <p className="text-red-500 text-xs mt-1">{photoError}</p>}
            {photos.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {photos.map((file, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-600">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            Next: Contact Info <FiArrowRight size={16} />
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="card p-6 space-y-5">
          <h2 className="font-bold text-lg text-gray-800">Step 2: Contact Details</h2>

          <div>
            <label className="label">WhatsApp Number <span className="text-red-500">*</span></label>
            <div className="relative">
              <FaWhatsapp size={16} className="absolute left-3 top-3.5 text-green-500" />
              <input {...step2Form.register('whatsapp')} type="tel" className="input-field pl-9"
                placeholder="e.g. 08012345678 or +2348012345678" />
            </div>
            {step2Form.formState.errors.whatsapp && <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.whatsapp.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Clients will contact you directly on this number</p>
          </div>

          <div>
            <label className="label">Alternative Phone (optional)</label>
            <input {...step2Form.register('phone')} type="tel" className="input-field"
              placeholder="Another phone number" />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
            💡 Your WhatsApp number is visible to clients so they can contact you directly. Make sure it's active.
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-ghost flex items-center gap-1 border border-gray-200">
              <FiArrowLeft size={16} /> Back
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              Next: Safety & Submit <FiArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleStep3} className="card p-6 space-y-5">
          <h2 className="font-bold text-lg text-gray-800">Step 3: Safety & Submit</h2>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <input type="checkbox" {...step3Form.register('isPremium')} id="isPremium"
                className="mt-1 w-5 h-5 accent-yellow-500 rounded" />
              <div>
                <label htmlFor="isPremium" className="font-bold text-gray-800 cursor-pointer flex items-center gap-1.5">
                  <FaCrown size={16} className="text-yellow-500" />
                  Boost as Top Artisan — ₦5,000/month
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Get featured at the top of search results, earn a ⭐ premium badge, and get 3–5x more visibility.
                  You'll be redirected to Paystack to complete payment after approval.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <h3 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-1.5">
              <FiAlertCircle size={15} /> Important Safety Notice
            </h3>
            <p className="text-red-700 text-xs leading-relaxed">
              NaijaFixHub does not process payments between artisans and clients. All payments (cash, bank transfer, WhatsApp deals)
              are handled directly between you and the client. We are not responsible for any financial disputes.
              Listing scam content (advance fees, gift card requests) will result in permanent ban.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" {...step3Form.register('agreeTerms')} id="agreeTerms"
              className="mt-1 w-5 h-5 accent-primary-600 rounded" />
            <label htmlFor="agreeTerms" className="text-sm text-gray-700 cursor-pointer">
              I confirm that my listing contains accurate information. I agree not to post scam content, request advance fees, or mislead clients.
              I understand that NaijaFixHub does not handle payments.{' '}
              <Link to="/terms" className="text-primary-600 underline">Terms of Service</Link>
            </label>
          </div>
          {step3Form.formState.errors.agreeTerms && (
            <p className="text-red-500 text-xs -mt-3">{step3Form.formState.errors.agreeTerms.message}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-ghost flex items-center gap-1 border border-gray-200">
              <FiArrowLeft size={16} /> Back
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCheck size={18} />
              )}
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
