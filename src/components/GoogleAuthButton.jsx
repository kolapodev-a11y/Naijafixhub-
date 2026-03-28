import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.4 14.8 2.5 12 2.5A9.5 9.5 0 1 0 12 21.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12Z"
      />
      <path
        fill="#4285F4"
        d="M21.1 12.3c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.4-1.1 2.6-2.4 3.5l3 2.3c1.8-1.7 3.1-4.3 3.1-8.1Z"
      />
      <path fill="#FBBC05" d="M6 14a5.8 5.8 0 0 1 0-4l-3.1-2.4a9.5 9.5 0 0 0 0 8.8L6 14Z" />
      <path
        fill="#34A853"
        d="M12 21.5c2.8 0 5.1-.9 6.8-2.5l-3-2.3c-.8.6-1.9 1.1-3.8 1.1-3.2 0-5.9-2.7-6.8-5.2l-3.1 2.4A9.5 9.5 0 0 0 12 21.5Z"
      />
    </svg>
  )
}

export default function GoogleAuthButton({ mode = 'login', onAuthenticated, onError }) {
  const [loading, setLoading] = useState(false)
  const hasClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
  const actionText = mode === 'register' ? 'Continue with Google' : 'Sign in with Google'

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    ux_mode: 'popup',
    prompt: 'select_account',
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        const accessToken = tokenResponse?.access_token
        if (!accessToken) {
          throw new Error('Google did not return an access token. Please try again.')
        }
        await onAuthenticated?.({ accessToken })
      } catch (error) {
        onError?.(error)
      } finally {
        setLoading(false)
      }
    },
    onError: (err) => {
      setLoading(false)
      if (err?.error === 'popup_closed_by_user' || err?.error === 'access_denied') return
      onError?.(new Error(err?.error_description || 'Google sign-in failed. Please try again.'))
    },
  })

  if (!hasClientId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Google sign-in is disabled until <code>VITE_GOOGLE_CLIENT_ID</code> is added to your frontend environment.
      </div>
    )
  }

  const handleClick = () => {
    if (loading) return
    window.google?.accounts?.id?.disableAutoSelect?.()
    googleLogin()
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:border-primary-300 hover:bg-primary-50"
        onClick={handleClick}
        disabled={loading}
      >
        <GoogleIcon />
        <span>{loading ? 'Connecting to Google…' : actionText}</span>
      </button>
      <p className="text-center text-xs text-gray-400">Google account chooser opens in a popup so users can switch accounts easily.</p>
    </div>
  )
}
