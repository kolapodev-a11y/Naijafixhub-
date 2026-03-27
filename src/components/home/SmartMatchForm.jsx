import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiSend, FiAlertCircle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { requestAPI } from '../../utils/api'
import { containsScamKeywords } from '../../utils/helpers'
import { NIGERIAN_STATES, URGENCY_OPTIONS, CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const schema = z.object({
  description: z.string().min(10, 'Please describe what you need (min 10 chars)').max(500),
  location: z.string().min(2, 'Please enter your location'),
  urgency: z.string().min(1, 'Please select urgency'),
  whatsapp: z.string().min(7, 'Enter your WhatsApp number').max(20),
  category: z.string().optional(),
})

export default function SmartMatchForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
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

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-card text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Request Posted!</h3>
        <p className="text-gray-500 mb-4">
          Artisans near you will see your request and reach out via WhatsApp shortly.
        </p>
        <button onClick={() => setSubmitted(false)} className="btn-primary">
          Post Another Request
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          ⚡ Smart Match – Post Your Need
        </h2>
        <p className="text-white/80 text-sm mt-1">
          Tell us what you need — artisans will contact you on WhatsApp
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        {/* Category */}
        <div>
          <label className="label">Category (Optional)</label>
          <select {...register('category')} className="input-field">
            <option value="">— Select Category —</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="label">What do you need? <span className="text-red-500">*</span></label>
          <textarea
            {...register('description')}
            rows={3}
            className={`input-field resize-none ${errors.description ? 'ring-2 ring-red-300 border-red-300' : ''}`}
            placeholder='e.g. "I need a plumber to fix a leaking pipe urgently"'
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <FiAlertCircle size={12} /> {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Location */}
          <div>
            <label className="label">Your Location <span className="text-red-500">*</span></label>
            <input
              {...register('location')}
              className={`input-field ${errors.location ? 'ring-2 ring-red-300 border-red-300' : ''}`}
              placeholder="e.g. Akure, Ondo State"
            />
            {errors.location && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FiAlertCircle size={12} /> {errors.location.message}
              </p>
            )}
          </div>

          {/* Urgency */}
          <div>
            <label className="label">How urgent? <span className="text-red-500">*</span></label>
            <select {...register('urgency')} className={`input-field ${errors.urgency ? 'ring-2 ring-red-300 border-red-300' : ''}`}>
              <option value="">— Select —</option>
              {URGENCY_OPTIONS.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            {errors.urgency && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FiAlertCircle size={12} /> {errors.urgency.message}
              </p>
            )}
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="label">Your WhatsApp Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <FaWhatsapp size={16} className="absolute left-3 top-3.5 text-green-500" />
            <input
              {...register('whatsapp')}
              className={`input-field pl-9 ${errors.whatsapp ? 'ring-2 ring-red-300 border-red-300' : ''}`}
              placeholder="e.g. 08012345678"
              type="tel"
            />
          </div>
          {errors.whatsapp && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <FiAlertCircle size={12} /> {errors.whatsapp.message}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">Artisans will contact you on this number</p>
        </div>

        {/* Safety note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          ⚠️ Never pay anyone upfront before verifying their identity. Deals happen directly between you and the artisan.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-accent w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiSend size={16} />
          )}
          {loading ? 'Posting...' : 'Post My Request Now'}
        </button>
      </form>
    </div>
  )
}
