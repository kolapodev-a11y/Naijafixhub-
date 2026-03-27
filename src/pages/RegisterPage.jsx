import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include at least one uppercase letter')
    .regex(/[0-9]/, 'Must include at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'artisan']),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = data
      await authRegister(payload)
      toast.success('Account created! Welcome to NaijaFixHub 🎉')
      navigate(redirect)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">NF</span>
            </div>
            <span className="text-primary-700 font-extrabold text-2xl">NaijaFixHub</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of Nigerians on NaijaFixHub</p>
        </div>

        <div className="card p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'user', label: '🔍 I\'m looking for services', desc: 'Find trusted artisans' },
              { value: 'artisan', label: '🔧 I offer services', desc: 'List your skills & get hired' },
            ].map(r => (
              <label
                key={r.value}
                className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${selectedRole === r.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}
              >
                <input type="radio" {...register('role')} value={r.value} className="hidden" />
                <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input {...register('name')} className={`input-field pl-9 ${errors.name ? 'ring-2 ring-red-300 border-red-300' : ''}`}
                  placeholder="Your full name" autoComplete="name" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={11} />{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input {...register('email')} type="email" className={`input-field pl-9 ${errors.email ? 'ring-2 ring-red-300 border-red-300' : ''}`}
                  placeholder="you@example.com" autoComplete="email" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={11} />{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'}
                  className={`input-field pl-9 pr-9 ${errors.password ? 'ring-2 ring-red-300 border-red-300' : ''}`}
                  placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={11} />{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input {...register('confirmPassword')} type="password"
                  className={`input-field pl-9 ${errors.confirmPassword ? 'ring-2 ring-red-300 border-red-300' : ''}`}
                  placeholder="Re-enter password" autoComplete="new-password" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={11} />{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
              className="text-primary-600 font-semibold hover:text-primary-700">
              Sign In
            </Link>
          </p>

          <p className="mt-3 text-xs text-gray-400 text-center">
            By registering, you agree to our{' '}
            <Link to="/terms" className="text-primary-500 underline">Terms</Link> &{' '}
            <Link to="/privacy" className="text-primary-500 underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
