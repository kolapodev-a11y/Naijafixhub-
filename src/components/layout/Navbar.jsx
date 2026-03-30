import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { getInitials } from '../../utils/helpers'
import NotificationBell from './NotificationBell'
import { FiMenu, FiX, FiSearch, FiUser, FiLogOut, FiSettings, FiPlusCircle, FiShield } from 'react-icons/fi'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, canOfferServices } = useAuth()
  const { pendingCount } = useApp()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
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
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-purple-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">NF</span></div>
            <div className="hidden sm:block">
              <span className="text-primary-700 font-extrabold text-lg leading-none">Naija</span>
              <span className="text-accent-600 font-extrabold text-lg leading-none">FixHub</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'}`}>Home</NavLink>
            <NavLink to="/search" className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'}`}>Browse Services</NavLink>
            {(!isAuthenticated || canOfferServices) && (
              <NavLink to="/post-service" className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'}`}>Offer a Service</NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-purple-100 text-primary-700' : 'text-primary-600 hover:bg-purple-100'}`}>
                <FiShield size={14} />
                Admin
                {pendingCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">{pendingCount > 9 ? '9+' : pendingCount}</span>}
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/search')} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" aria-label="Search">
              <FiSearch size={20} />
            </button>

            {isAuthenticated ? (
              <>
                <NotificationBell />

                {canOfferServices && (
                  <Link to="/post-service" className="hidden sm:flex btn-accent text-sm py-2 px-4 items-center gap-1.5">
                    <FiPlusCircle size={16} />
                    <span>Post Service</span>
                  </Link>
                )}

                <div className="relative" ref={dropRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-primary-50 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{getInitials(user?.name)}</div>
                    {isAdmin && <span className="hidden sm:block text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Admin</span>}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
                        <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-primary-700">{user?.accountType || 'customer'}</p>
                      </div>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"><FiUser size={15} /> My Profile</Link>
                      {canOfferServices && <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"><FiSettings size={15} /> My Services</Link>}
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50 transition-colors">
                          <FiShield size={15} />
                          Admin Dashboard
                          {pendingCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{pendingCount}</span>}
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1">
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"><FiLogOut size={15} /> Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4 hidden sm:block">Join Free</Link>
              </div>
            )}

            <button className="md:hidden p-2 text-gray-500 hover:text-primary-600 rounded-lg transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>Home</NavLink>
          <NavLink to="/search" onClick={() => setMenuOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>Browse Services</NavLink>
          {(!isAuthenticated || canOfferServices) && <NavLink to="/post-service" onClick={() => setMenuOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>Offer a Service</NavLink>}
          {isAuthenticated && <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>My Profile</NavLink>}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 ${isActive ? 'bg-purple-50' : ''}`}>
              <FiShield size={14} /> Admin Dashboard {pendingCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{pendingCount}</span>}
            </NavLink>
          )}
          {!isAuthenticated && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-outline text-sm flex-1 text-center py-2">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm flex-1 text-center py-2">Join Free</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
