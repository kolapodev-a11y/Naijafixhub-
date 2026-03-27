import React, { createContext, useContext, useReducer } from 'react'

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

  const setStateFilter = (s) => dispatch({ type: 'SET_STATE_FILTER', payload: s })
  const setCategoryFilter = (c) => dispatch({ type: 'SET_CATEGORY_FILTER', payload: c })
  const setSearchQuery = (q) => dispatch({ type: 'SET_SEARCH_QUERY', payload: q })
  const addNotification = (n) => dispatch({ type: 'ADD_NOTIFICATION', payload: n })
  const clearNotifications = () => dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  const setPendingCount = (n) => dispatch({ type: 'SET_PENDING_COUNT', payload: n })

  return (
    <AppContext.Provider value={{
      ...state,
      setStateFilter, setCategoryFilter, setSearchQuery,
      addNotification, clearNotifications, setPendingCount,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
