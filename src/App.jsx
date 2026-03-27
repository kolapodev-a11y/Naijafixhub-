import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import { PageLoader } from './components/ui/LoadingSpinner'

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ArtisanDetailPage = lazy(() => import('./pages/ArtisanDetailPage'))
const PostServicePage = lazy(() => import('./pages/PostServicePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />
        <Route path="/artisan/:id" element={<Layout><ArtisanDetailPage /></Layout>} />
        <Route path="/post-service" element={<Layout><PostServicePage /></Layout>} />

        {/* Auth routes (no footer on login/register) */}
        <Route path="/login" element={<Layout noFooter><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout noFooter><RegisterPage /></Layout>} />

        {/* Protected routes */}
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        <Route path="/my-listings" element={<Layout><SearchPage mine /></Layout>} />

        {/* Admin */}
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/*" element={<Layout><AdminDashboard /></Layout>} />

        {/* Static pages */}
        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />

        {/* 404 */}
        <Route path="/404" element={<Layout><NotFoundPage /></Layout>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}

// Simple static pages
function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Terms of Service</h1>
      <div className="card p-8 prose prose-gray max-w-none text-sm leading-relaxed space-y-4">
        <p><strong>Last updated:</strong> {new Date().getFullYear()}</p>
        <h2 className="text-lg font-bold mt-6">1. Acceptance of Terms</h2>
        <p>By using NaijaFixHub, you agree to these terms. This platform connects service seekers with artisans. We do not participate in transactions.</p>
        <h2 className="text-lg font-bold mt-6">2. No Payment Processing</h2>
        <p><strong>NaijaFixHub does NOT process, hold, or facilitate payments.</strong> All financial transactions occur directly between users and artisans. We are not responsible for any payment disputes.</p>
        <h2 className="text-lg font-bold mt-6">3. Content Policy</h2>
        <p>No scam content, advance fee requests, gift card solicitation, or misleading listings are allowed. Violations result in immediate account suspension.</p>
        <h2 className="text-lg font-bold mt-6">4. User Responsibility</h2>
        <p>Users are responsible for verifying artisans before engaging. Always check reviews, photos, and meet in public where possible.</p>
        <h2 className="text-lg font-bold mt-6">5. Contact</h2>
        <p>Email: <a href="mailto:peezutech@gmail.com" className="text-primary-600">peezutech@gmail.com</a></p>
      </div>
    </div>
  )
}

function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Privacy Policy</h1>
      <div className="card p-8 prose prose-gray max-w-none text-sm leading-relaxed space-y-4">
        <p><strong>Last updated:</strong> {new Date().getFullYear()}</p>
        <h2 className="text-lg font-bold mt-6">Data We Collect</h2>
        <p>We collect name, email, phone number, and service listing details for platform operation. Photos uploaded are stored on our servers.</p>
        <h2 className="text-lg font-bold mt-6">Data Usage</h2>
        <p>Data is used to connect artisans with clients. We do not sell personal data to third parties.</p>
        <h2 className="text-lg font-bold mt-6">Cookies</h2>
        <p>We use cookies for authentication and session management only.</p>
        <h2 className="text-lg font-bold mt-6">Contact</h2>
        <p>For privacy concerns: <a href="mailto:peezutech@gmail.com" className="text-primary-600">peezutech@gmail.com</a></p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
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
