import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HeroSection from '../components/home/HeroSection'
import SmartMatchForm from '../components/home/SmartMatchForm'
import CategoryGrid from '../components/home/CategoryGrid'
import StateFilter from '../components/home/StateFilter'
import FeaturedArtisans from '../components/home/FeaturedArtisans'
import ArtisanCard from '../components/artisan/ArtisanCard'
import { SkeletonCard } from '../components/ui/LoadingSpinner'
import { artisanAPI, paymentAPI } from '../utils/api'
import { readCache, writeCache } from '../utils/cache'
import { FiArrowRight, FiShield, FiZap } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const HOME_FEED_TTL_MS = 5 * 60 * 1000
const buildHomeFeedCacheKey = (selectedState) => `naijafixhub_home_feed:${selectedState || 'All States'}`

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, canOfferServices, hasPremiumProvider } = useAuth()
  const [selectedState, setSelectedState] = useState('All States')
  const initialCache = useMemo(() => readCache(buildHomeFeedCacheKey('All States'), HOME_FEED_TTL_MS), [])
  const [artisans, setArtisans] = useState(initialCache?.artisans || [])
  const [featuredArtisans, setFeaturedArtisans] = useState(initialCache?.featuredArtisans || [])
  const [loading, setLoading] = useState(!initialCache)
  const [premiumLoading, setPremiumLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    const cacheKey = buildHomeFeedCacheKey(selectedState)
    const cachedFeed = readCache(cacheKey, HOME_FEED_TTL_MS)

    if (cachedFeed) {
      setArtisans(cachedFeed.artisans || [])
      setFeaturedArtisans(cachedFeed.featuredArtisans || [])
      setLoading(false)
    } else {
      setLoading(true)
    }

    ;(async () => {
      try {
        const params = { limit: 8 }
        if (selectedState !== 'All States') params.state = selectedState

        const { data } = await artisanAPI.getHomeFeed(params)
        if (!isMounted) return

        const nextFeed = {
          artisans: data.artisans || [],
          featuredArtisans: data.featuredArtisans || [],
        }

        setArtisans(nextFeed.artisans)
        setFeaturedArtisans(nextFeed.featuredArtisans)
        writeCache(cacheKey, nextFeed)
      } catch {
        if (!cachedFeed && isMounted) {
          setArtisans([])
          setFeaturedArtisans([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [selectedState])

  const handleStateSelect = (stateName) => {
    setSelectedState(stateName)
  }

  const handlePremiumUpgrade = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in before starting a premium upgrade.')
      navigate('/login?redirect=/')
      return
    }

    if (!canOfferServices) {
      toast.error('Switch your account type to Provider or Both before upgrading to premium.')
      navigate('/profile')
      return
    }

    if (hasPremiumProvider) {
      toast.success('Your premium access is already active.')
      navigate('/profile')
      return
    }

    setPremiumLoading(true)
    try {
      const { data } = await paymentAPI.initiatePremium()
      window.location.href = data.paymentUrl
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start premium payment.')
    } finally {
      setPremiumLoading(false)
    }
  }

  return (
    <div>
      <HeroSection />

      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🔍', step: '1', title: 'Post or Search', desc: 'Describe what you need or browse artisans by category' },
              { icon: '✅', step: '2', title: 'Choose Verified', desc: 'Select from moderated, trusted artisans with reviews' },
              { icon: '💬', step: '3', title: 'Connect via WhatsApp', desc: 'Chat directly, agree on price, and get the job done' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                <div>
                  <p className="font-bold text-gray-800">{item.title}</p>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Browse by Category</h2>
            <Link to="/search" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              See all <FiArrowRight size={14} />
            </Link>
          </div>
          <CategoryGrid />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
          <div className="lg:col-span-1">
            <SmartMatchForm />
          </div>
          <div className="lg:col-span-2">
            <FeaturedArtisans artisans={featuredArtisans} loading={loading && featuredArtisans.length === 0} />
          </div>
        </section>

        <section className="mb-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="section-title">Artisans Near You</h2>
              <p className="mt-1 text-sm text-gray-500">
                {selectedState === 'All States'
                  ? 'Fresh approved services are loaded immediately when the homepage opens.'
                  : `Showing approved services in ${selectedState}.`}
              </p>
            </div>
            <Link to="/search" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="mb-5">
            <StateFilter selected={selectedState} onSelect={handleStateSelect} />
          </div>

          {loading && artisans.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : artisans.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 font-medium">No artisans found for {selectedState}</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to offer services here!</p>
              <Link to="/post-service" className="btn-primary inline-flex mt-4 text-sm">Offer Your Service</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {artisans.map((artisan, index) => (
                <ArtisanCard
                  key={artisan._id}
                  artisan={artisan}
                  imageLoading={index < 4 ? 'eager' : 'lazy'}
                  imageFetchPriority={index < 4 ? 'high' : 'auto'}
                />
              ))}
            </div>
          )}
        </section>

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
                  '🚫 Never pay advance fees or gift cards',
                  '📧 Report issues to peezutech@gmail.com',
                ].map((tip) => <div key={tip} className="flex items-start gap-1.5"><span className="mt-0.5">{tip}</span></div>)}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <Link to="/post-service" className="btn-accent flex items-center gap-2 justify-center whitespace-nowrap"><FiZap size={16} /> Offer Your Service</Link>
              <a href="mailto:peezutech@gmail.com" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl text-center text-sm transition-colors whitespace-nowrap">Report an Issue</a>
            </div>
          </div>
        </section>

        {!hasPremiumProvider && (
          <section className="rounded-3xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-8 text-center">
            <FaCrown size={36} className="mx-auto mb-3 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium upgrade for all your listings</h2>
            <p className="mx-auto mb-5 max-w-2xl text-sm text-gray-600">
              One successful upgrade covers your current listings and future listings too, helping them stand out with stronger placement,
              better trust signals, and a premium badge while your plan is active.
            </p>
            <button onClick={handlePremiumUpgrade} disabled={premiumLoading} className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-8 py-3 font-bold text-yellow-950 transition hover:bg-yellow-400 disabled:opacity-70">
              {premiumLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-950/30 border-t-yellow-950" /> : <FaCrown size={16} />}
              {premiumLoading ? 'Starting payment...' : 'Upgrade to Premium – ₦5,000/month'}
            </button>
            {!isAuthenticated && <p className="mt-4 text-xs text-gray-500">You will be asked to sign in first.</p>}
          </section>
        )}
      </div>
    </div>
  )
}
