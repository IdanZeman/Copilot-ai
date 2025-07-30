import React, { createContext, useContext, useReducer } from 'react'

// Action Types
const actionTypes = {
  SET_USER: 'SET_USER',
  SET_CART_ITEMS: 'SET_CART_ITEMS',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ORDERS: 'SET_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
}

// Initial State
const initialState = {
  user: {
    id: null,
    name: '',
    email: '',
    phone: '',
    isAuthenticated: false
  },
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0
  },
  orders: [],
  ui: {
    isLoading: false,
    error: null,
    currentPage: 'home'
  }
}

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: { ...action.payload, isAuthenticated: true }
      }

    case actionTypes.SET_CART_ITEMS:
      const cartItems = action.payload
      return {
        ...state,
        cart: {
          items: cartItems,
          totalItems: cartItems.reduce((total, item) => total + item.totalQuantity, 0),
          totalPrice: cartItems.reduce((total, item) => total + item.totalPrice, 0)
        }
      }

    case actionTypes.ADD_TO_CART:
      const newItem = action.payload
      const updatedItems = [...state.cart.items, newItem]
      return {
        ...state,
        cart: {
          items: updatedItems,
          totalItems: updatedItems.reduce((total, item) => total + item.totalQuantity, 0),
          totalPrice: updatedItems.reduce((total, item) => total + item.totalPrice, 0)
        }
      }

    case actionTypes.REMOVE_FROM_CART:
      const filteredItems = state.cart.items.filter(item => item.id !== action.payload)
      return {
        ...state,
        cart: {
          items: filteredItems,
          totalItems: filteredItems.reduce((total, item) => total + item.totalQuantity, 0),
          totalPrice: filteredItems.reduce((total, item) => total + item.totalPrice, 0)
        }
      }

    case actionTypes.UPDATE_CART_ITEM:
      const { itemId, updates } = action.payload
      const updateItems = state.cart.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
      return {
        ...state,
        cart: {
          items: updateItems,
          totalItems: updateItems.reduce((total, item) => total + item.totalQuantity, 0),
          totalPrice: updateItems.reduce((total, item) => total + item.totalPrice, 0)
        }
      }

    case actionTypes.CLEAR_CART:
      return {
        ...state,
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0
        }
      }

    case actionTypes.SET_ORDERS:
      return {
        ...state,
        orders: action.payload
      }

    case actionTypes.ADD_ORDER:
      return {
        ...state,
        orders: [action.payload, ...state.orders]
      }

    case actionTypes.SET_LOADING:
      return {
        ...state,
        ui: { ...state.ui, isLoading: action.payload }
      }

    case actionTypes.SET_ERROR:
      return {
        ...state,
        ui: { ...state.ui, error: action.payload }
      }

    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Actions
  const actions = {
    setUser: (user) => dispatch({ type: actionTypes.SET_USER, payload: user }),
    
    setCartItems: (items) => dispatch({ type: actionTypes.SET_CART_ITEMS, payload: items }),
    
    addToCart: (item) => dispatch({ type: actionTypes.ADD_TO_CART, payload: item }),
    
    removeFromCart: (itemId) => dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: itemId }),
    
    updateCartItem: (itemId, updates) => dispatch({ 
      type: actionTypes.UPDATE_CART_ITEM, 
      payload: { itemId, updates } 
    }),
    
    clearCart: () => dispatch({ type: actionTypes.CLEAR_CART }),
    
    setOrders: (orders) => dispatch({ type: actionTypes.SET_ORDERS, payload: orders }),
    
    addOrder: (order) => dispatch({ type: actionTypes.ADD_ORDER, payload: order }),
    
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),

    // Utility actions
    loginUser: (userData) => {
      localStorage.setItem('user', JSON.stringify(userData))
      dispatch({ type: actionTypes.SET_USER, payload: userData })
    },

    logoutUser: () => {
      localStorage.removeItem('user')
      dispatch({ type: actionTypes.SET_USER, payload: initialState.user })
      dispatch({ type: actionTypes.CLEAR_CART })
    },

    loadUserFromStorage: () => {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        dispatch({ type: actionTypes.SET_USER, payload: JSON.parse(savedUser) })
      }
    },

    loadCartFromStorage: () => {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        dispatch({ type: actionTypes.SET_CART_ITEMS, payload: JSON.parse(savedCart) })
      }
    },

    saveCartToStorage: () => {
      localStorage.setItem('cart', JSON.stringify(state.cart.items))
    }
  }

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom Hook
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext
