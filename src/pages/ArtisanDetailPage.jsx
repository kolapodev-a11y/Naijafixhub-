import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { artisanAPI, reportAPI } from '../utils/api'
import { formatPrice, generateCallLink, generateSmsLink, generateWhatsAppLink, getInitials, resolveAssetUrl, timeAgo } from '../utils/helpers'
import { CATEGORIES } from '../utils/constants'
import { StarDisplay, StarInput } from '../components/ui/StarRating'
import Modal from '../components/ui/Modal'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FiAlertTriangle, FiChevronLeft, FiChevronRight, FiClock, FiFlag, FiMapPin, FiMessageSquare, FiPhone, FiSend, FiShield, FiStar } from 'react-icons/fi'
import { FaCrown, FaWhatsapp } from 'react-icons/fa'

const reportSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason'),
  details: z.string().optional(),
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
  const category = CATEGORIES.find((c) => c.id === artisan?.category)
  const isOwnListing = artisan?.user?._id && user?._id && artisan.user._id === user._id
  const totalPhotos = artisan?.photos?.length || 0
  const hasMultiplePhotos = totalPhotos > 1

  useEffect(() => {
    Promise.all([artisanAPI.getById(id), artisanAPI.getReviews(id)])
      .then(([artisanRes, reviewsRes]) => {
        setArtisan(artisanRes.data.artisan)
        setReviews(reviewsRes.data.reviews || [])
      })
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    setActivePhoto(0)
  }, [artisan?._id])

  const { register: regReport, handleSubmit: handleReport, reset: resetReport, formState: { errors: reportErrors } } = useForm({ resolver: zodResolver(reportSchema) })
  const { register: regReview, handleSubmit: handleReview, reset: resetReview, formState: { errors: reviewErrors } } = useForm()

  const goToPrevPhoto = () => {
    if (!hasMultiplePhotos) return
    setActivePhoto((currentIndex) => (currentIndex === 0 ? totalPhotos - 1 : currentIndex - 1))
  }

  const goToNextPhoto = () => {
    if (!hasMultiplePhotos) return
    setActivePhoto((currentIndex) => (currentIndex === totalPhotos - 1 ? 0 : currentIndex + 1))
  }

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
    if (isOwnListing) {
      toast.error('You cannot review your own service.')
      return
    }
    if (reviewRating === 0) {
      toast.error('Please select a star rating')
      return
    }
    try {
      await artisanAPI.addReview(id, { ...data, rating: reviewRating })
      toast.success('Review submitted!')
      setReviewModal(false)
      resetReview()
      setReviewRating(0)
      const res = await artisanAPI.getReviews(id)
      setReviews(res.data.reviews || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review.')
    }
  }

  if (loading) return <PageLoader />
  if (!artisan) return null

  const primaryContact = artisan.phone || artisan.whatsapp || ''
  const waLink = generateWhatsAppLink(artisan.whatsapp || primaryContact, `Hi ${artisan.title}, I found you on NaijaFixHub and I need your services.`)
  const callLink = generateCallLink(primaryContact)
  const smsLink = generateSmsLink(primaryContact, `Hello ${artisan.title}, I found your service on NaijaFixHub.`)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 transition-colors hover:text-primary-600">
        <FiChevronLeft size={18} /> Back to results
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {artisan.photos?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="relative h-80 bg-white sm:h-[28rem]">
                <img src={resolveAssetUrl(artisan.photos[activePhoto])} alt={artisan.title} className="h-full w-full object-contain p-4" />
                {artisan.isPremium && <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-bold text-yellow-900 shadow-lg"><FaCrown size={12} /> TOP ARTISAN</div>}
                {artisan.status === 'approved' && <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow"><FiShield size={12} /> Verified</div>}
                <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow">
                  {activePhoto + 1} / {totalPhotos}
                </div>

                {hasMultiplePhotos && (
                  <>
                    <button onClick={goToPrevPhoto} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:bg-white">
                      <FiChevronLeft size={18} />
                    </button>
                    <button onClick={goToNextPhoto} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:bg-white">
                      <FiChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
              {hasMultiplePhotos && (
                <div className="scrollbar-hide flex gap-2 overflow-x-auto p-3">
                  {artisan.photos.map((photo, index) => (
                    <button key={photo + index} onClick={() => setActivePhoto(index)} className={`flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-white transition-all ${activePhoto === index ? 'border-primary-500 shadow-sm' : 'border-gray-200 hover:border-primary-200'}`}>
                      <img src={resolveAssetUrl(photo)} alt={`photo ${index + 1}`} className="h-full w-full object-contain p-1.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: category?.color || '#7C3AED' }}>{category?.icon} {category?.name || artisan.category}</span>
                <h1 className="mt-2 text-2xl font-extrabold text-gray-800">{artisan.title}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500"><FiMapPin size={14} /> {artisan.location}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-primary-700">{formatPrice(artisan.startingPrice)}</p>
                {artisan.priceLabel && <p className="text-xs text-gray-400">{artisan.priceLabel}</p>}
              </div>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <StarDisplay rating={artisan.rating || 0} reviewCount={artisan.reviewCount || 0} size={16} />
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><FiClock size={11} /> Listed {timeAgo(artisan.createdAt)}</span>
            </div>

            <div className="prose prose-sm mb-4 max-w-none text-gray-600"><p>{artisan.description}</p></div>
            {artisan.serviceArea && <div className="rounded-xl bg-primary-50 p-3 text-sm text-primary-800"><strong>Service Area:</strong> {artisan.serviceArea}</div>}
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800"><FiStar className="text-yellow-400" /> Reviews ({reviews.length})</h2>
              {isAuthenticated && !isOwnListing && <button onClick={() => setReviewModal(true)} className="btn-outline py-2 text-sm">Write Review</button>}
            </div>

            {isOwnListing && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                You cannot review or rate your own service listing.
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-xs font-bold text-white">{getInitials(review.user?.name || 'U')}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">{review.user?.name || 'Anonymous'}</span>
                          <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                        </div>
                        <StarDisplay rating={review.rating} showValue={false} size={12} />
                        <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5 lg:sticky lg:top-20">
            <h3 className="mb-4 font-bold text-gray-800">Contact This Provider</h3>
            <div className="grid gap-3">
              <a href={waLink} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-bold text-white transition-colors hover:bg-green-600"><FaWhatsapp size={18} /> Chat on WhatsApp</a>
              <a href={callLink} className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"><FiPhone size={15} /> Call</a>
              <a href={smsLink} className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"><FiMessageSquare size={15} /> Send Message</a>
              <button onClick={() => setContactModal(true)} className="btn-outline flex w-full items-center justify-center gap-2 text-sm"><FiSend size={15} /> Contact Tips</button>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="mb-1 text-xs font-medium text-amber-800">⚠️ Safety Reminder</p>
              <p className="text-xs text-amber-700">Always verify before paying. NaijaFixHub never holds funds.</p>
            </div>

            <button onClick={() => setReportModal(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"><FiFlag size={13} /> Report This Artisan</button>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Artisan Info</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Status</span><span className={`font-medium ${artisan.status === 'approved' ? 'text-green-600' : 'text-orange-500'}`}>{artisan.status === 'approved' ? '✅ Verified' : '⏳ Pending'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Availability</span><span className="font-medium capitalize text-gray-700">{artisan.serviceStatus || 'active'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Location</span><span className="font-medium text-gray-700">{artisan.location}</span></div>
              {artisan.isPremium && <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="flex items-center gap-1 font-medium text-yellow-600"><FaCrown size={12} /> Premium</span></div>}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={reportModal} onClose={() => setReportModal(false)} title="🚨 Report Artisan">
        <form onSubmit={handleReport(onReport)} className="space-y-4">
          <div>
            <label className="label">Reason for report <span className="text-red-500">*</span></label>
            <textarea {...regReport('reason')} rows={3} className="input-field resize-none" placeholder="Describe the issue (scam, fake profile, misconduct...)" />
            {reportErrors.reason && <p className="mt-1 text-xs text-red-500">{reportErrors.reason.message}</p>}
          </div>
          <div>
            <label className="label">Additional details</label>
            <input {...regReport('details')} className="input-field" placeholder="Any additional context" />
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">All reports are reviewed by our admin team. False reports may result in account suspension.</div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setReportModal(false)} className="btn-ghost flex-1 border border-gray-200">Cancel</button>
            <button type="submit" className="btn-danger flex-1">Submit Report</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="⭐ Write a Review">
        <form onSubmit={handleReview(onReviewSubmit)} className="space-y-4">
          <div>
            <label className="label">Your Rating <span className="text-red-500">*</span></label>
            <StarInput value={reviewRating} onChange={setReviewRating} />
          </div>
          <div>
            <label className="label">Your Comment <span className="text-red-500">*</span></label>
            <textarea {...regReview('comment', { required: 'Comment required' })} rows={3} className="input-field resize-none" placeholder="Share your experience..." />
            {reviewErrors.comment && <p className="mt-1 text-xs text-red-500">{reviewErrors.comment.message}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setReviewModal(false)} className="btn-ghost flex-1 border border-gray-200">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Submit Review</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={contactModal} onClose={() => setContactModal(false)} title="💬 Contact options">
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">NaijaFixHub recommends WhatsApp first, then a phone call if you need to confirm urgency or directions quickly.</div>
          <div className="grid gap-3">
            <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-bold text-white transition-colors hover:bg-green-600"><FaWhatsapp size={18} /> Open WhatsApp Chat</a>
            <a href={callLink} className="flex items-center justify-center gap-2 rounded-xl border border-primary-200 py-3 font-semibold text-primary-700 transition-colors hover:bg-primary-50"><FiPhone size={15} /> Call this provider</a>
            <a href={smsLink} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"><FiMessageSquare size={15} /> Send SMS</a>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <FiAlertTriangle className="mt-0.5" /> Verify details before making any payment or sending personal documents.
          </div>
        </div>
      </Modal>
    </div>
  )
}
