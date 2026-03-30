import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

const AppContext = createContext(null)

const initialState = {
  selectedState: 'All States',
  selectedCategory: '',
  searchQuery: '',
  notifications: [],
  pendingCount: 0,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE_FILTER':
      return { ...state, selectedState: action.payload }
    case 'SET_CATEGORY_FILTER':
      return { ...state, selectedCategory: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications.slice(0, 9)] }
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] }
    case 'SET_PENDING_COUNT':
      return { ...state, pendingCount: action.payload }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const setStateFilter = useCallback((value) => {
    dispatch({ type: 'SET_STATE_FILTER', payload: value })
  }, [])

  const setCategoryFilter = useCallback((value) => {
    dispatch({ type: 'SET_CATEGORY_FILTER', payload: value })
  }, [])

  const setSearchQuery = useCallback((value) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: value })
  }, [])

  const addNotification = useCallback((value) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: value })
  }, [])

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  }, [])

  const setPendingCount = useCallback((value) => {
    dispatch({ type: 'SET_PENDING_COUNT', payload: value })
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      setStateFilter,
      setCategoryFilter,
      setSearchQuery,
      addNotification,
      clearNotifications,
      setPendingCount,
    }),
    [state, setStateFilter, setCategoryFilter, setSearchQuery, addNotification, clearNotifications, setPendingCount],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
