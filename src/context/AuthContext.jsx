import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { authAPI } from '../utils/api'

const TOKEN_KEY = 'naijafixhub_token'
const USER_KEY = 'naijafixhub_user'

const AuthContext = createContext(null)

const initialState = {
  user: (() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })(),
  token: localStorage.getItem(TOKEN_KEY) || null,
  loading: true,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    case 'STOP_LOADING':
      return {
        ...state,
        loading: false,
      }
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        loading: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    async function loadUser() {
      if (!state.token) {
        dispatch({ type: 'STOP_LOADING' })
        return
      }

      try {
        const { data } = await authAPI.getMe()
        const nextPayload = { user: data.user, token: state.token }
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        dispatch({ type: 'SET_AUTH', payload: nextPayload })
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        dispatch({ type: 'LOGOUT' })
      }
    }

    loadUser()
  }, [state.token])

  const persistAuth = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    dispatch({ type: 'SET_AUTH', payload: data })
    return data.user
  }

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token && state.user),
      isAdmin: state.user?.role === 'admin',

      async login(payload) {
        const { data } = await authAPI.login(payload)
        return persistAuth(data)
      },

      async register(payload) {
        const { data } = await authAPI.register(payload)
        return persistAuth(data)
      },

      async googleAuth(payload) {
        const { data } = await authAPI.googleAuth(payload)
        return persistAuth(data)
      },

      async googleLogin(payload) {
        const { data } = await authAPI.googleAuth(payload)
        return persistAuth(data)
      },

      updateUser(userPatch) {
        const nextUser = { ...(state.user || {}), ...(userPatch || {}) }
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
        dispatch({ type: 'UPDATE_USER', payload: nextUser })
      },

      logout() {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        dispatch({ type: 'LOGOUT' })
      },
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
