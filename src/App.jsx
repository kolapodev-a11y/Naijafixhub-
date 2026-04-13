import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/layout/ScrollToTop'
import { PageLoader } from './components/ui/LoadingSpinner'

const HomePage = lazy(() => import('./pages/HomePage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ArtisanDetailPage = lazy(() => import('./pages/ArtisanDetailPage'))
const PostServicePage = lazy(() => import('./pages/PostServicePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-extrabold text-gray-800">Terms of Service</h1>
      <div className="card space-y-4 p-8 text-sm leading-relaxed prose prose-gray max-w-none">
        <p>
          <strong>Last updated:</strong> {new Date().getFullYear()}
        </p>
        <h2 className="mt-6 text-lg font-bold">1. Acceptance of Terms</h2>
        <p>By using NaijaFixHub, you agree to these terms. This platform connects service seekers with artisans. We do not participate in transactions.</p>
        <h2 className="mt-6 text-lg font-bold">2. No Payment Processing</h2>
        <p>
          <strong>NaijaFixHub does NOT process, hold, or facilitate payments.</strong> All financial transactions occur directly between users and artisans.
        </p>
        <h2 className="mt-6 text-lg font-bold">3. Content Policy</h2>
        <p>No scam content, advance fee requests, gift card solicitation, or misleading listings are allowed. Violations result in account suspension.</p>
      </div>
    </div>
  )
}

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-extrabold text-gray-800">Privacy Policy</h1>
      <div className="card space-y-4 p-8 text-sm leading-relaxed prose prose-gray max-w-none">
        <p>
          <strong>Last updated:</strong> {new Date().getFullYear()}
        </p>
        <h2 className="mt-6 text-lg font-bold">Data We Collect</h2>
        <p>We collect name, email address, phone number, profile information, and listing details required to operate the platform securely.</p>
        <h2 className="mt-6 text-lg font-bold">Data Usage</h2>
        <p>Data is used to connect artisans with clients, protect the marketplace, and send operational notifications such as approvals and premium updates.</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />
        <Route path="/artisan/:id" element={<Layout><ArtisanDetailPage /></Layout>} />
        <Route path="/post-service" element={<Layout><PostServicePage /></Layout>} />
        <Route path="/login" element={<Layout noFooter><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout noFooter><RegisterPage /></Layout>} />
        <Route path="/payment/verify" element={<Layout><PaymentCallbackPage /></Layout>} />
        <Route path="/payment/callback" element={<Layout><PaymentCallbackPage /></Layout>} />

        <Route
          path="/profile"
          element={
            <Layout>
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            </Layout>
          }
        />
        <Route
          path="/my-listings"
          element={
            <Layout>
              <RequireAuth>
                <SearchPage mine />
              </RequireAuth>
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout noFooter>
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            </Layout>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Layout noFooter>
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            </Layout>
          }
        />

        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/404" element={<Layout><NotFoundPage /></Layout>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F2937',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
              },
            }}
          />
        </Router>
      </AppProvider>
    </AuthProvider>
  )
}
