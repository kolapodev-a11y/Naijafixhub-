import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'
import GoogleAuthButton from '../components/GoogleAuthButton'

const accountOptions = [
  {
    value: 'customer',
    title: 'Customer',
    subtitle: 'Find trusted artisans and post service requests.',
  },
  {
    value: 'provider',
    title: 'Provider',
    subtitle: 'Offer services, manage listings, and upgrade to premium.',
  },
  {
    value: 'both',
    title: 'Both',
    subtitle: 'Hire artisans and also promote your own services.',
  },
]

const schema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
    accountType: z.enum(['customer', 'provider', 'both']),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

function AccountTypeSelector({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {accountOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-2xl border p-4 text-left transition ${
            value === option.value
              ? 'border-primary-500 bg-primary-50 shadow-sm ring-2 ring-primary-100'
              : 'border-gray-200 bg-white hover:border-primary-200'
          }`}
        >
          <p className="text-sm font-bold text-gray-800">{option.title}</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">{option.subtitle}</p>
        </button>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const { register: signup, googleAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', accountType: 'customer' },
  })

  const getDestination = (accountType) => {
    if (redirect) return redirect
    return ['provider', 'both'].includes(accountType) ? '/post-service' : '/'
  }

  async function onSubmit(values) {
    try {
      await signup({
        name: values.name,
        email: values.email,
        password: values.password,
        accountType: values.accountType,
      })
      toast.success('Account created successfully!')
      navigate(getDestination(values.accountType), { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  async function handleGoogleSuccess({ accessToken }) {
    try {
      const accountType = form.getValues('accountType')
      await googleAuth({ accessToken, mode: 'register', accountType })
      toast.success('Signed up with Google successfully!')
      navigate(getDestination(accountType), { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Google sign-up failed. Please try again.')
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Choose the kind of account you want, then continue with email or Google. You can change this later from your profile settings."
      footer={
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-semibold text-primary-700" to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">Select account type</p>
          <p className="text-xs text-gray-500">Required during signup.</p>
        </div>
        <AccountTypeSelector value={form.watch('accountType')} onChange={(value) => form.setValue('accountType', value, { shouldValidate: true })} />
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <input className="input-field" placeholder="Full name" {...form.register('name')} />
          {form.formState.errors.name && <p className="mt-2 text-sm text-red-600">{form.formState.errors.name.message}</p>}
        </div>

        <div>
          <input className="input-field" placeholder="Email address" {...form.register('email')} />
          {form.formState.errors.email && <p className="mt-2 text-sm text-red-600">{form.formState.errors.email.message}</p>}
        </div>

        <div>
          <input type="password" className="input-field" placeholder="Password" {...form.register('password')} />
          {form.formState.errors.password && <p className="mt-2 text-sm text-red-600">{form.formState.errors.password.message}</p>}
        </div>

        <div>
          <input type="password" className="input-field" placeholder="Confirm password" {...form.register('confirmPassword')} />
          {form.formState.errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>}
        </div>

        <button className="btn-primary w-full" type="submit">
          Create Account
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs uppercase tracking-wide text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleAuthButton
        mode="register"
        onAuthenticated={handleGoogleSuccess}
        onError={(error) => toast.error(error?.response?.data?.message || error?.message || 'Google sign-up failed. Please try again.')}
      />
    </AuthShell>
  )
}
