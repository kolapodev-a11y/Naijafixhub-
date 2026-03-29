import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../utils/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiSave, FiLock } from 'react-icons/fi'
import { getInitials } from '../utils/helpers'

const roleBadgeMap = {
  admin: { label: '🛡️ Admin', className: 'bg-primary-100 text-primary-700' },
  artisan: { label: '🔧 Service Provider', className: 'bg-amber-100 text-amber-700' },
  both: { label: '🔄 Seeker + Provider', className: 'bg-emerald-100 text-emerald-700' },
  user: { label: '👤 Service Seeker', className: 'bg-gray-100 text-gray-600' },
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  })

  const badge = roleBadgeMap[user?.role] || roleBadgeMap.user

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.updateProfile(data)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {getInitials(user?.name)}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <FiUser size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input {...register('name', { required: 'Name required' })}
                className="input-field pl-9" placeholder="Your full name" />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FiMail size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input {...register('email')} type="email" disabled
                className="input-field pl-9 bg-gray-50 cursor-not-allowed text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary flex items-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={15} />}
            Save Changes
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiLock size={16} className="text-gray-500" /> Change Password
        </h2>
        <p className="text-gray-500 text-sm mb-4">Use a strong password to keep your account secure.</p>
        <div className="space-y-3">
          <input type="password" className="input-field" placeholder="Current password" />
          <input type="password" className="input-field" placeholder="New password" />
          <input type="password" className="input-field" placeholder="Confirm new password" />
          <button className="btn-outline text-sm py-2">Update Password</button>
        </div>
      </div>
    </div>
  )
}
