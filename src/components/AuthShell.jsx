import { Link } from 'react-router-dom'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-lavender px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="hidden rounded-[2rem] bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 p-8 text-white shadow-2xl lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-extrabold">NF</div>
            <div>
              <p className="text-xl font-extrabold">NaijaFixHub</p>
              <p className="text-sm text-white/75">Trusted artisans near you</p>
            </div>
          </div>

          <h1 className="mb-3 text-4xl font-black leading-tight">Hire trusted pros or grow your service business.</h1>
          <p className="max-w-xl text-sm leading-6 text-white/85">
            Sign in to find reliable artisans, manage your profile, post service requests, and publish your own verified listing professionally.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              'Email/password and Google sign-in supported',
              'Choose whether you want to hire or offer services',
              'Posting services requires a logged-in account',
              'Premium listings and admin review stay protected',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-lg font-extrabold text-white lg:mx-0">
              NF
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{subtitle}</p>
          </div>

          <div className="space-y-5">{children}</div>

          <div className="mt-6 border-t border-gray-100 pt-5 text-center lg:text-left">{footer}</div>

          <div className="mt-4 text-center text-xs text-gray-400 lg:text-left">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="font-medium text-primary-700 hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-primary-700 hover:underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  )
}
