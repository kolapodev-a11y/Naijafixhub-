import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiMapPin, FiArrowRight, FiCheckCircle } from 'react-icons/fi'

const HERO_EXAMPLES = [
  '"Plumber in Akure urgently"',
  '"Electrician in Lagos Island"',
  '"Tailor for wedding dress in Abuja"',
  '"House cleaner in Port Harcourt"',
  '"AC repair in Ibadan same day"',
]

export default function HeroSection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [placeholder] = useState(() => HERO_EXAMPLES[Math.floor(Math.random() * HERO_EXAMPLES.length)])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <section className="relative overflow-hidden bg-hero-gradient min-h-[480px] sm:min-h-[540px] flex items-center">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-72 h-72 bg-accent-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-primary-900/30" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/20">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          100% Free to Browse • Verified Artisans • Nigeria-Wide
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
          Need a fix today?{' '}
          <span className="text-yellow-300">Find trusted</span>
          <br className="hidden sm:block" /> artisans near you
        </h1>
        <p className="text-white/80 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
          Connect with verified plumbers, electricians, tailors, cleaners & more across Nigeria – instantly via WhatsApp.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-3">
              <FiSearch size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="btn-accent flex items-center justify-center gap-2 py-3 sm:py-2 whitespace-nowrap"
            >
              Find Now <FiArrowRight size={16} />
            </button>
          </div>
          <p className="text-white/60 text-xs mt-2">
            Try: {HERO_EXAMPLES[0]} or {HERO_EXAMPLES[1]}
          </p>
        </form>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/80 text-sm">
          {[
            { icon: '✅', text: '1,200+ Verified Artisans' },
            { icon: '⭐', text: '4.8/5 Average Rating' },
            { icon: '🗺️', text: '36 States + FCT Covered' },
            { icon: '💬', text: 'WhatsApp Direct Contact' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-1.5">
              <span>{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
