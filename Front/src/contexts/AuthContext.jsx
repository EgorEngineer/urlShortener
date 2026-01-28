import React, { createContext, useState, useContext, useEffect } from 'react'
import { loginUser, registerUser, getCurrentUser } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const userData = await getCurrentUser()
          setUser(userData)
          setToken(savedToken)
        } catch (error) {
          console.error('Failed to get current user:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password)
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('token', response.token)
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  const register = async (email, username, password) => {
    try {
      const response = await registerUser(email, username, password)
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('token', response.token)
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

