import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'
import GoogleAuthButton from '../components/GoogleAuthButton'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  intent: z.enum(['user', 'artisan']),
})

function IntentSelector({ value, onChange }) {
  const options = [
    { value: 'user', title: 'I need a service', subtitle: 'Find artisans and post requests' },
    { value: 'artisan', title: 'I offer a service', subtitle: 'Manage listings and premium upgrades' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-2xl border px-3 py-3 text-left transition ${
            value === option.value
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200'
          }`}
        >
          <p className="text-sm font-bold">{option.title}</p>
          <p className="mt-1 text-xs text-current/80">{option.subtitle}</p>
        </button>
      ))}
    </div>
  )
}

export default function LoginPage() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', intent: 'user' },
  })

  const getDestination = (intent, user) => {
    if (redirect) return redirect
    if (intent === 'artisan' || user?.role === 'artisan') return '/post-service'
    return '/'
  }

  async function onSubmit(values) {
    try {
      const user = await login({ email: values.email, password: values.password })
      toast.success(`Welcome back${user?.name ? `, ${user.name}` : ''}!`)
      navigate(getDestination(values.intent, user), { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.')
    }
  }

  async function handleGoogleLogin({ accessToken }) {
    try {
      const intent = form.getValues('intent')
      const user = await googleLogin({ accessToken, mode: 'login', role: intent })
      toast.success('Google login successful!')
      navigate(getDestination(intent, user), { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Google login failed. Please try again.')
    }
  }

  return (
    <AuthShell
      title="Sign in to NaijaFixHub"
      subtitle="Choose whether you are here to hire someone or offer your own service, then continue with email or Google."
      footer={
        <p className="text-sm text-slate-500">
          No account yet?{' '}
          <Link className="font-semibold text-primary-700" to={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
            Create one
          </Link>
        </p>
      }
    >
      <IntentSelector value={form.watch('intent')} onChange={(value) => form.setValue('intent', value, { shouldValidate: true })} />

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <input className="input-field" placeholder="Email address" {...form.register('email')} />
          {form.formState.errors.email && <p className="mt-2 text-sm text-red-600">{form.formState.errors.email.message}</p>}
        </div>

        <div>
          <input type="password" className="input-field" placeholder="Password" {...form.register('password')} />
          {form.formState.errors.password && <p className="mt-2 text-sm text-red-600">{form.formState.errors.password.message}</p>}
        </div>

        <button className="btn-primary w-full" type="submit">
          Sign In
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs uppercase tracking-wide text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleAuthButton mode="login" onAuthenticated={handleGoogleLogin} onError={(error) => toast.error(error?.response?.data?.message || error?.message || 'Google login failed. Please try again.')} />
    </AuthShell>
  )
}
