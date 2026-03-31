import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FaCrown } from 'react-icons/fa'
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { authAPI, paymentAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/helpers'

export default function PaymentCallbackPage() {
  const [params] = useSearchParams()
  const { updateUser } = useAuth()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('Verifying your payment, please wait…')
  const [paymentDetails, setPaymentDetails] = useState(null)

  useEffect(() => {
    async function verify() {
      const reference = params.get('reference') || params.get('trxref')
      if (!reference) {
        setStatus('error')
        setMessage('Missing payment reference. Please contact support.')
        return
      }

      try {
        const { data } = await paymentAPI.verifyPayment(reference)
        setStatus('success')
        setPaymentDetails(data)
        setMessage(data.message || 'Payment verified successfully. Your premium provider plan is now active.')

        if (data.user) {
          updateUser(data.user)
        } else {
          try {
            const me = await authAPI.getMe()
            if (me?.data?.user) updateUser(me.data.user)
          } catch {
            // ignore refresh errors here; primary verification already succeeded
          }
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Unable to verify payment. Please try again.')
      }
    }

    verify()
  }, [params, updateUser])

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-14">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-accent-700 px-8 py-7 text-white">
          <div className="flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              <FaCrown className="text-yellow-300" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Premium Provider</p>
              <h1 className="text-2xl font-extrabold">Payment verification</h1>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-8 text-center sm:text-left">
          {status === 'verifying' && <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600 sm:mx-0" />}
          {status === 'success' && (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:mx-0">
              <FiCheckCircle size={28} />
            </div>
          )}
          {status === 'error' && (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 sm:mx-0">
              <FiAlertTriangle size={28} />
            </div>
          )}

          <div>
            <p className="text-lg font-bold text-slate-900">{status === 'success' ? 'Premium activated successfully' : status === 'error' ? 'Payment verification failed' : 'We are checking your payment'}</p>
            <p className="mt-2 text-slate-600">{message}</p>
          </div>

          {status === 'success' && paymentDetails && (
            <div className="grid gap-5 rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-5 md:grid-cols-[1.1fr,0.9fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">Your premium benefits are live</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {(paymentDetails.premiumFeatures || []).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-yellow-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subscription details</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p><strong>Reference:</strong> {paymentDetails.reference}</p>
                  {paymentDetails.premiumExpiresAt && <p><strong>Active until:</strong> {formatDate(paymentDetails.premiumExpiresAt)}</p>}
                  <p><strong>Coverage:</strong> current and future listings</p>
                </div>
              </div>
            </div>
          )}

          {status !== 'verifying' && (
            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-start">
              <Link to="/profile" className="btn-primary">
                View my profile
              </Link>
              <Link to="/" className="btn-outline">
                Back to home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
