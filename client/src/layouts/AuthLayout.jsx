import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FitLife Gym</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your fitness journey</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
