import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle, FiMessageSquare, FiShield } from 'react-icons/fi'
import SmartMatchForm from '../components/home/SmartMatchForm'

const benefits = [
  'Describe the job once and let verified artisans contact you directly.',
  'Share your location, urgency, and WhatsApp number in one simple form.',
  'Stay protected with anti-spam checks and safety reminders before hiring.',
]

export default function PostRequestPage() {
  return (
    <div className="bg-gradient-to-b from-primary-50 via-white to-white">
      <section className="border-b border-primary-100 bg-white/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              <FiMessageSquare size={13} /> Customer request desk
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Post your request directly</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
              Tell NaijaFixHub what you need, where you are, and how urgent it is. Verified artisans can then reach out to you on WhatsApp quickly.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link to="/search" className="btn-outline inline-flex items-center justify-center gap-2 text-sm">
                Browse services first <FiArrowRight size={14} />
              </Link>
              <Link to="/requests" className="btn-ghost inline-flex items-center justify-center gap-2 border border-gray-200 text-sm">
                Browse open requests
              </Link>
            </div>
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-primary-100 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FiShield size={16} /> What happens next?
            </div>
            <div className="space-y-3">
              {benefits.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-primary-50/70 px-4 py-3 text-sm text-gray-700">
                  <FiCheckCircle size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <SmartMatchForm />

          <aside className="space-y-4">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-base font-bold text-amber-900">Before you submit</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900/90">
                <li>Use a real WhatsApp number artisans can reach.</li>
                <li>Be specific about the work to get better responses.</li>
                <li>Never pay upfront without verifying the artisan.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Prefer to hire by browsing?</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                You can also compare artisan profiles, photos, and reviews before sending a message.
              </p>
              <Link to="/search" className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 text-sm">
                Explore artisan listings <FiArrowRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
