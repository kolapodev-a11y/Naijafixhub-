import React from 'react'

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' }
  return (
    <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin ${className}`} />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-lavender">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold">NF</span>
        </div>
        <span className="text-primary-700 font-extrabold text-xl">NaijaFixHub</span>
      </div>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-500 text-sm">Loading...</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="bg-gray-200 rounded-xl h-40 mb-4" />
      <div className="space-y-2">
        <div className="bg-gray-200 rounded h-4 w-3/4" />
        <div className="bg-gray-200 rounded h-3 w-1/2" />
        <div className="bg-gray-200 rounded h-3 w-2/3" />
      </div>
    </div>
  )
}
