import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { getInitials } from '../../utils/helpers'
import NotificationBell from './NotificationBell'
import Modal from '../ui/Modal'
import { FiBriefcase, FiHome, FiLogOut, FiMenu, FiMessageSquare, FiPlusCircle, FiSearch, FiShield, FiUser, FiUsers, FiX } from 'react-icons/fi'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, canOfferServices, canRequestServices, accountType } = useAuth()
  const { pendingCount } = useApp()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    setDropdownOpen(false)
    setMenuOpen(false)
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutConfirm(false)
    navigate('/')
  }

  const showBrowseServices = !isAuthenticated || canRequestServices
  const showBrowseRequests = isAuthenticated && canOfferServices
  const showPostRequest = !isAuthenticated || canRequestServices
  const showOfferService = !isAuthenticated || canOfferServices

  const navLinkClass = ({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'}`

  return (
    <nav className="sticky top-0 z-50 border-b border-purple-100 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600"><span className="text-sm font-bold text-white">NF</span></div>
            <div className="hidden sm:block">
              <span className="text-lg font-extrabold leading-none text-primary-700">Naija</span>
              <span className="text-lg font-extrabold leading-none text-accent-600">FixHub</span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            {showBrowseServices && <NavLink to="/search" className={navLinkClass}>Browse Services</NavLink>}
            {showBrowseRequests && <NavLink to="/requests" className={navLinkClass}>Browse Requests</NavLink>}
            {showPostRequest && <NavLink to="/" className={navLinkClass}>Post Request</NavLink>}
            {showOfferService && <NavLink to="/post-service" className={navLinkClass}>Offer a Service</NavLink>}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-purple-100 text-primary-700' : 'text-primary-600 hover:bg-purple-100'}`}>
                <FiShield size={14} />
                Admin
                {pendingCount > 0 && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{pendingCount > 9 ? '9+' : pendingCount}</span>}
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate(showBrowseServices ? '/search' : '/requests')} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-600" aria-label="Search">
              <FiSearch size={20} />
            </button>

            {isAuthenticated ? (
              <>
                <NotificationBell />

                {showOfferService && (
                  <Link to="/post-service" className="hidden items-center gap-1.5 btn-accent px-4 py-2 text-sm sm:flex">
                    <FiPlusCircle size={16} />
                    <span>Post Service</span>
                  </Link>
                )}

                <div className="relative" ref={dropRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-primary-50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white">{getInitials(user?.name)}</div>
                    {isAdmin && <span className="hidden rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 sm:block">Admin</span>}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white py-1 shadow-xl">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-gray-800">{user?.name}</p>
                        <p className="truncate text-xs text-gray-400">{user?.email}</p>
                        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-primary-700">{accountType || 'customer'}</p>
                      </div>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700"><FiUser size={15} /> My Profile</Link>
                      {canRequestServices && <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700"><FiMessageSquare size={15} /> My Requests</Link>}
                      {canOfferServices && <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700"><FiBriefcase size={15} /> My Services</Link>}
                      {showBrowseRequests && <Link to="/requests" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700"><FiUsers size={15} /> Browse Requests</Link>}
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50">
                          <FiShield size={15} />
                          Admin Dashboard
                          {pendingCount > 0 && <span className="rounded-full bg-red-500 px-1.5 text-xs text-white">{pendingCount}</span>}
                        </Link>
                      )}
                      <div className="mt-1 border-t border-gray-100">
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"><FiLogOut size={15} /> Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost py-2 text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary hidden px-4 py-2 text-sm sm:block">Join Free</Link>
              </div>
            )}

            <button className="rounded-lg p-2 text-gray-500 transition-colors hover:text-primary-600 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="space-y-1 border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}><span className="inline-flex items-center gap-2"><FiHome size={15} /> Home</span></NavLink>
          {showBrowseServices && <NavLink to="/search" onClick={() => setMenuOpen(false)} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>Browse Services</NavLink>}
          {showBrowseRequests && <NavLink to="/requests" onClick={() => setMenuOpen(false)} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>Browse Requests</NavLink>}
          {showPostRequest && <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>Post Request</NavLink>}
          {showOfferService && <NavLink to="/post-service" onClick={() => setMenuOpen(false)} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>Offer a Service</NavLink>}
          {isAuthenticated && <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>My Profile</NavLink>}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-primary-600 ${isActive ? 'bg-purple-50' : ''}`}>
              <FiShield size={14} /> Admin Dashboard {pendingCount > 0 && <span className="rounded-full bg-red-500 px-1.5 text-xs text-white">{pendingCount}</span>}
            </NavLink>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
              <FiLogOut size={15} /> Sign Out
            </button>
          )}
          {!isAuthenticated && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-outline flex-1 py-2 text-center text-sm">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 py-2 text-center text-sm">Join Free</Link>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Confirm logout" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to sign out of your NaijaFixHub account?</p>
          <div className="flex gap-3">
            <button onClick={() => setShowLogoutConfirm(false)} className="btn-ghost flex-1 border border-gray-200">Cancel</button>
            <button onClick={confirmLogout} className="btn-danger flex-1">Yes, sign out</button>
          </div>
        </div>
      </Modal>
    </nav>
  )
}
