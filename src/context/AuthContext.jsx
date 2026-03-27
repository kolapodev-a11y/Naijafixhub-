import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authAPI } from '../utils/api'
import { isAdmin } from '../utils/helpers'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    case 'LOGOUT':
      return { ...initialState, loading: false }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('naijafixhub_token')
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }
    try {
      const { data } = await authAPI.getMe()
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, token },
      })
    } catch {
      localStorage.removeItem('naijafixhub_token')
      localStorage.removeItem('naijafixhub_user')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  useEffect(() => { initAuth() }, [initAuth])

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials)
    localStorage.setItem('naijafixhub_token', data.token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: data })
    return data
  }, [])

  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData)
    localStorage.setItem('naijafixhub_token', data.token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: data })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('naijafixhub_token')
    localStorage.removeItem('naijafixhub_user')
    dispatch({ type: 'LOGOUT' })
  }, [])

  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
  }, [])

  const value = {
    ...state,
    isAdmin: isAdmin(state.user),
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
