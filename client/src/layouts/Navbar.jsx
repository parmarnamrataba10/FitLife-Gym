import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { FiMenu, FiMoon, FiSun, FiBell, FiLogOut, FiUser } from 'react-icons/fi'
import { notificationService } from '../services/notificationService'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await notificationService.getUnreadCount()
        setUnreadCount(data.count)
      } catch { /* ignore */ }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <FiMenu className="text-xl text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
          {user?.role || 'User'}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          {dark ? <FiSun className="text-xl text-yellow-500" /> : <FiMoon className="text-xl text-gray-500" />}
        </button>
        <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <FiBell className="text-xl text-gray-600 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
          </button>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 py-1">
                <button onClick={() => { setShowDropdown(false); navigate('/profile') }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiUser /> Profile
                </button>
                <hr className="border-gray-200 dark:border-gray-700" />
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiLogOut /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
