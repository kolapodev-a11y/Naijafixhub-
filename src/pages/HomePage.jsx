import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HeroSection from '../components/home/HeroSection'
import SmartMatchForm from '../components/home/SmartMatchForm'
import CategoryGrid from '../components/home/CategoryGrid'
import StateFilter from '../components/home/StateFilter'
import FeaturedArtisans from '../components/home/FeaturedArtisans'
import ArtisanCard from '../components/artisan/ArtisanCard'
import { SkeletonCard } from '../components/ui/LoadingSpinner'
import { artisanAPI } from '../utils/api'
import { FiArrowRight, FiShield, FiStar, FiZap } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'

export default function HomePage() {
  const navigate = useNavigate()
  const [selectedState, setSelectedState] = useState('All States')
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = {}
    if (selectedState !== 'All States') params.state = selectedState
    params.limit = 8
    params.status = 'approved'
    artisanAPI.getAll(params)
      .then(r => setArtisans(r.data.artisans || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedState])

  const handleStateSelect = (s) => {
    setSelectedState(s)
    setLoading(true)
  }

  return (
    <div>
      <HeroSection />

      {/* How it works banner */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🔍', step: '1', title: 'Post or Search', desc: 'Describe what you need or browse artisans by category' },
              { icon: '✅', step: '2', title: 'Choose Verified', desc: 'Select from moderated, trusted artisans with reviews' },
              { icon: '💬', step: '3', title: 'Connect via WhatsApp', desc: 'Chat directly, agree on price, and get the job done' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{item.title}</p>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Browse by Category</h2>
            <Link to="/search" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              See all <FiArrowRight size={14} />
            </Link>
          </div>
          <CategoryGrid />
        </section>

        {/* Smart Match + Featured split */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
          <div className="lg:col-span-1">
            <SmartMatchForm />
          </div>
          <div className="lg:col-span-2">
            <FeaturedArtisans />
          </div>
        </section>

        {/* Latest Artisans */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Artisans Near You</h2>
            <Link to="/search" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          {/* State filter */}
          <div className="mb-5">
            <StateFilter selected={selectedState} onSelect={handleStateSelect} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : artisans.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 font-medium">No artisans found for {selectedState}</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to offer services here!</p>
              <Link to="/post-service" className="btn-primary inline-flex mt-4 text-sm">
                Offer Your Service
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {artisans.map(a => <ArtisanCard key={a._id} artisan={a} />)}
            </div>
          )}
        </section>

        {/* Safety Section */}
        <section className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-3xl p-8 mb-12 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <FiShield size={22} className="text-green-400" />
                <h2 className="text-2xl font-bold">Safety First 🇳🇬</h2>
              </div>
              <p className="text-white/80 text-sm mb-4 font-medium">
                ⚠️ Payments & deals happen directly between you and the artisan (WhatsApp, bank transfer, cash).<br />
                <strong className="text-yellow-300">NaijaFixHub does not hold funds — verify before paying.</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/80">
                {[
                  '✅ Check reviews & photos before hiring',
                  '✅ Meet in a public place if possible',
                  '🚫 Never pay "advance fees" or gift cards',
                  '📧 Report issues to peezutech@gmail.com',
                ].map(tip => (
                  <div key={tip} className="flex items-start gap-1.5">
                    <span className="mt-0.5">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <Link to="/post-service" className="btn-accent flex items-center gap-2 justify-center whitespace-nowrap">
                <FiZap size={16} /> Offer Your Service
              </Link>
              <a href="mailto:peezutech@gmail.com"
                className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl text-center text-sm transition-colors whitespace-nowrap">
                Report an Issue
              </a>
            </div>
          </div>
        </section>

        {/* Premium CTA */}
        <section className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-8 text-center">
          <FaCrown size={36} className="text-yellow-900 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-yellow-900 mb-2">Become a Top Artisan</h2>
          <p className="text-yellow-800 mb-5 max-w-md mx-auto">
            Get featured at the top of search results, earn a verified badge, and get more clients for just ₦5,000/month.
          </p>
          <Link to="/post-service" className="bg-yellow-900 hover:bg-yellow-800 text-white font-bold px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
            <FaCrown size={16} /> Boost My Profile – ₦5,000/mo
          </Link>
        </section>
      </div>
    </div>
  )
}
