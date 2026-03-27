import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { artisanAPI, reportAPI } from '../utils/api'
import { formatPrice, generateWhatsAppLink, timeAgo, getInitials } from '../utils/helpers'
import { CATEGORIES } from '../utils/constants'
import { StarDisplay, StarInput } from '../components/ui/StarRating'
import Modal from '../components/ui/Modal'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  FiMapPin, FiPhone, FiShield, FiFlag, FiChevronLeft,
  FiSend, FiMessageCircle, FiClock, FiStar, FiAlertTriangle
} from 'react-icons/fi'
import { FaCrown, FaWhatsapp } from 'react-icons/fa'

const reportSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason'),
  details: z.string().optional(),
})

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Please write a short comment'),
})

export default function ArtisanDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [artisan, setArtisan] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [reportModal, setReportModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [contactModal, setContactModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const category = CATEGORIES.find(c => c.id === artisan?.category)

  useEffect(() => {
    Promise.all([artisanAPI.getById(id), artisanAPI.getReviews(id)])
      .then(([artisanRes, reviewsRes]) => {
        setArtisan(artisanRes.data.artisan)
        setReviews(reviewsRes.data.reviews || [])
      })
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [id])

  const { register: regReport, handleSubmit: handleReport, reset: resetReport, formState: { errors: reportErrors } } = useForm({ resolver: zodResolver(reportSchema) })
  const { register: regReview, handleSubmit: handleReview, reset: resetReview, formState: { errors: reviewErrors } } = useForm()
  const { register: regContact, handleSubmit: handleContact, reset: resetContact, formState: { errors: contactErrors } } = useForm()

  const onReport = async (data) => {
    try {
      await reportAPI.submit({ artisanId: id, ...data })
      toast.success('Report submitted. We will review it shortly.')
      setReportModal(false)
      resetReport()
    } catch {
      toast.error('Failed to submit report.')
    }
  }

  const onReviewSubmit = async (data) => {
    if (reviewRating === 0) { toast.error('Please select a star rating'); return }
    try {
      await artisanAPI.addReview(id, { ...data, rating: reviewRating })
      toast.success('Review submitted!')
      setReviewModal(false)
      resetReview()
      setReviewRating(0)
      const res = await artisanAPI.getReviews(id)
      setReviews(res.data.reviews || [])
    } catch {
      toast.error('Failed to submit review. You may have already reviewed this artisan.')
    }
  }

  if (loading) return <PageLoader />
  if (!artisan) return null

  const waLink = generateWhatsAppLink(
    artisan.whatsapp || '',
    `Hi ${artisan.title}, I found you on NaijaFixHub and I need your services.`
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <FiChevronLeft size={18} /> Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos gallery */}
          {artisan.photos?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="relative h-72 sm:h-96">
                <img
                  src={artisan.photos[activePhoto]}
                  alt={artisan.title}
                  className="w-full h-full object-cover"
                />
                {artisan.isPremium && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <FaCrown size={12} /> TOP ARTISAN
                  </div>
                )}
                {artisan.status === 'approved' && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    <FiShield size={12} /> Verified
                  </div>
                )}
              </div>
              {artisan.photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                  {artisan.photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activePhoto === i ? 'border-primary-500' : 'border-gray-200'}`}
                    >
                      <img src={photo} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details card */}
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: category?.color || '#7C3AED' }}
                  >
                    {category?.icon} {category?.name || artisan.category}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800 mt-2">{artisan.title}</h1>
                <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <FiMapPin size={14} /> {artisan.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-primary-700">
                  {formatPrice(artisan.startingPrice)}
                </p>
                {artisan.priceLabel && (
                  <p className="text-xs text-gray-400">{artisan.priceLabel}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <StarDisplay rating={artisan.rating || 0} reviewCount={artisan.reviewCount || 0} size={16} />
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FiClock size={11} /> Listed {timeAgo(artisan.createdAt)}
              </span>
            </div>

            <div className="prose prose-sm max-w-none text-gray-600 mb-4">
              <p>{artisan.description}</p>
            </div>

            {artisan.serviceArea && (
              <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary-800">
                <strong>Service Area:</strong> {artisan.serviceArea}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FiStar className="text-yellow-400" /> Reviews ({reviews.length})
              </h2>
              {isAuthenticated && (
                <button onClick={() => setReviewModal(true)} className="btn-outline text-sm py-2">
                  Write Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review._id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(review.user?.name || 'U')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700 text-sm">{review.user?.name || 'Anonymous'}</span>
                          <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                        </div>
                        <StarDisplay rating={review.rating} showValue={false} size={12} />
                        <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-5">
          {/* Contact CTA */}
          <div className="card p-5 sticky top-20">
            <h3 className="font-bold text-gray-800 mb-4">Contact This Artisan</h3>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl w-full transition-colors mb-3 text-sm"
            >
              <FaWhatsapp size={18} /> Chat on WhatsApp
            </a>
            <button
              onClick={() => setContactModal(true)}
              className="flex items-center justify-center gap-2 btn-outline w-full text-sm"
            >
              <FiSend size={15} /> Send a Message
            </button>

            {/* Safety note */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800 font-medium mb-1">⚠️ Safety Reminder</p>
              <p className="text-xs text-amber-700">
                Always verify before paying. NaijaFixHub never holds funds.
              </p>
            </div>

            <button
              onClick={() => setReportModal(true)}
              className="flex items-center justify-center gap-2 w-full mt-3 text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-xl text-xs font-medium transition-colors"
            >
              <FiFlag size={13} /> Report This Artisan
            </button>
          </div>

          {/* Artisan info card */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Artisan Info</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`font-medium ${artisan.status === 'approved' ? 'text-green-600' : 'text-orange-500'}`}>
                  {artisan.status === 'approved' ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location</span>
                <span className="font-medium text-gray-700">{artisan.location}</span>
              </div>
              {artisan.isPremium && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan</span>
                  <span className="font-medium text-yellow-600 flex items-center gap-1">
                    <FaCrown size={12} /> Premium
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* Report Modal */}
      <Modal isOpen={reportModal} onClose={() => setReportModal(false)} title="🚨 Report Artisan">
        <form onSubmit={handleReport(onReport)} className="space-y-4">
          <div>
            <label className="label">Reason for report <span className="text-red-500">*</span></label>
            <textarea {...regReport('reason')} rows={3} className="input-field resize-none"
              placeholder="Describe the issue (scam, fake profile, misconduct...)" />
            {reportErrors.reason && <p className="text-red-500 text-xs mt-1">{reportErrors.reason.message}</p>}
          </div>
          <div>
            <label className="label">Additional details</label>
            <input {...regReport('details')} className="input-field" placeholder="Any additional context" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            All reports are reviewed by our admin team. False reports may result in account suspension.
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setReportModal(false)} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
            <button type="submit" className="flex-1 btn-danger">Submit Report</button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="⭐ Write a Review">
        <form onSubmit={handleReview(onReviewSubmit)} className="space-y-4">
          <div>
            <label className="label">Your Rating <span className="text-red-500">*</span></label>
            <StarInput value={reviewRating} onChange={setReviewRating} />
          </div>
          <div>
            <label className="label">Your Comment <span className="text-red-500">*</span></label>
            <textarea {...regReview('comment', { required: 'Comment required' })} rows={3}
              className="input-field resize-none" placeholder="Share your experience..." />
            {reviewErrors.comment && <p className="text-red-500 text-xs mt-1">{reviewErrors.comment.message}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setReviewModal(false)} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
            <button type="submit" className="flex-1 btn-primary">Submit Review</button>
          </div>
        </form>
      </Modal>

      {/* Contact Modal */}
      <Modal isOpen={contactModal} onClose={() => setContactModal(false)} title="📬 Send a Message">
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            NaijaFixHub recommends using WhatsApp for fastest response. But you can also send a quick note below.
          </p>
          <a href={waLink} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-xl w-full hover:bg-green-600 transition-colors">
            <FaWhatsapp size={18} /> Open WhatsApp Chat
          </a>
          <div className="text-center text-gray-400 text-xs">— or leave a note —</div>
          <textarea className="input-field resize-none" rows={3} placeholder="Type your message..." />
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <FiSend size={15} /> Send Message
          </button>
        </div>
      </Modal>
    </div>
  )
}
