import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setUser(data.data)
    return data
  }

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    setUser(data.data)
    return data
  }

  const logout = async () => {
    await api.get('/auth/logout')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
