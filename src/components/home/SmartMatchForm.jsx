import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiSend, FiAlertCircle, FiLock } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { requestAPI } from '../../utils/api'
import { containsScamKeywords } from '../../utils/helpers'
import { URGENCY_OPTIONS, CATEGORIES } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({
  description: z.string().min(10, 'Please describe what you need (min 10 chars)').max(500),
  location: z.string().min(2, 'Please enter your location'),
  urgency: z.string().min(1, 'Please select urgency'),
  whatsapp: z.string().min(7, 'Enter your WhatsApp number').max(20),
  category: z.string().optional(),
})

export default function SmartMatchForm() {
  const { isAuthenticated, canRequestServices } = useAuth()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please sign in before posting a request.')
      navigate('/login?redirect=/')
      return
    }

    if (!canRequestServices) {
      toast.error('Your account type cannot post service requests. Choose the both option or a service-seeker account.')
      navigate('/profile')
      return
    }

    if (containsScamKeywords(data.description)) {
      toast.error('Your request contains suspicious keywords. Please revise.')
      return
    }

    setLoading(true)
    try {
      await requestAPI.create(data)
      setSubmitted(true)
      reset()
      toast.success('Request posted! Artisans will contact you via WhatsApp.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post request. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">⚡ Smart Match – Post Your Need</h2>
          <p className="mt-1 text-sm text-white/80">Users must be signed in before posting requests or contacting artisans professionally.</p>
        </div>

        <div className="space-y-5 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <FiLock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Login required</h3>
            <p className="mt-2 text-sm text-gray-500">
              To reduce spam and protect artisans, only logged-in users can post service requests.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/login?redirect=/" className="btn-primary text-center">
              Sign In
            </Link>
            <Link to="/register?redirect=/" className="btn-outline text-center">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!canRequestServices) {
    return (
      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">⚡ Smart Match – Post Your Need</h2>
          <p className="mt-1 text-sm text-white/80">This action is available for service seekers and both-role accounts.</p>
        </div>

        <div className="space-y-5 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <FiAlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Account type restriction</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your current account is set up only for offering services. Use a <strong>both</strong> account if you also want to post customer requests.
            </p>
          </div>
          <Link to="/search" className="btn-outline text-center">
            Browse Artisans Instead
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <span className="text-3xl">✅</span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-800">Request Posted!</h3>
        <p className="mb-4 text-gray-500">Artisans near you will see your request and reach out via WhatsApp shortly.</p>
        <button onClick={() => setSubmitted(false)} className="btn-primary">
          Post Another Request
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-5">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">⚡ Smart Match – Post Your Need</h2>
        <p className="mt-1 text-sm text-white/80">Tell us what you need and verified artisans can contact you on WhatsApp.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
        <div>
          <label className="label">Category (Optional)</label>
          <select {...register('category')} className="input-field">
            <option value="">— Select Category —</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            What do you need? <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className={`input-field resize-none ${errors.description ? 'border-red-300 ring-2 ring-red-300' : ''}`}
            placeholder='e.g. "I need a plumber to fix a leaking pipe urgently"'
          />
          {errors.description && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <FiAlertCircle size={12} /> {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              Your Location <span className="text-red-500">*</span>
            </label>
            <input
              {...register('location')}
              className={`input-field ${errors.location ? 'border-red-300 ring-2 ring-red-300' : ''}`}
              placeholder="e.g. Akure, Ondo State"
            />
            {errors.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <FiAlertCircle size={12} /> {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">
              How urgent? <span className="text-red-500">*</span>
            </label>
            <select {...register('urgency')} className={`input-field ${errors.urgency ? 'border-red-300 ring-2 ring-red-300' : ''}`}>
              <option value="">— Select —</option>
              {URGENCY_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
            {errors.urgency && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <FiAlertCircle size={12} /> {errors.urgency.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="label">
            Your WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaWhatsapp size={16} className="absolute left-3 top-3.5 text-green-500" />
            <input
              {...register('whatsapp')}
              className={`input-field pl-9 ${errors.whatsapp ? 'border-red-300 ring-2 ring-red-300' : ''}`}
              placeholder="e.g. 08012345678"
              type="tel"
            />
          </div>
          {errors.whatsapp && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <FiAlertCircle size={12} /> {errors.whatsapp.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">Artisans will contact you on this number</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          ⚠️ Never pay anyone upfront before verifying their identity. Deals happen directly between you and the artisan.
        </div>

        <button type="submit" disabled={loading} className="btn-accent flex w-full items-center justify-center gap-2">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <FiSend size={16} />}
          {loading ? 'Posting...' : 'Post My Request Now'}
        </button>
      </form>
    </div>
  )
}
