import React, { useEffect, useState } from 'react'
import Slider from 'react-slick'
import ArtisanCard from '../artisan/ArtisanCard'
import { artisanAPI } from '../../utils/api'
import { SkeletonCard } from '../ui/LoadingSpinner'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'

function Arrow({ direction, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 text-primary-600 hover:bg-primary-50 transition-all duration-200 ${direction === 'prev' ? '-left-4 sm:-left-5' : '-right-4 sm:-right-5'}`}
    >
      {direction === 'prev' ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
    </button>
  )
}

export default function FeaturedArtisans() {
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    artisanAPI.getFeatured()
      .then(r => setArtisans(r.data.artisans || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const settings = {
    dots: true,
    infinite: artisans.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <Arrow direction="next" />,
    prevArrow: <Arrow direction="prev" />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false } },
    ],
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <FaCrown className="text-yellow-500" size={20} />
        <h2 className="section-title">Top Artisans</h2>
        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">Premium</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : artisans.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400">No featured artisans yet.</p>
        </div>
      ) : (
        <div className="relative px-2">
          <Slider {...settings}>
            {artisans.map(a => (
              <div key={a._id} className="px-2">
                <ArtisanCard artisan={a} />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  )
}
