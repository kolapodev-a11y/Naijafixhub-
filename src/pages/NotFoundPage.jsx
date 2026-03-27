import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl mb-4">🔧</p>
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-600 mb-3">Page not found</p>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">Go to Home</Link>
          <Link to="/search" className="btn-outline">Browse Services</Link>
        </div>
      </div>
    </div>
  )
}
