import { useState, useEffect } from 'react'
import { notificationService } from '../services/notificationService'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import { FiBell, FiTrash2, FiCheck, FiCheckSquare, FiInfo, FiAlertTriangle, FiCalendar } from 'react-icons/fi'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const { addToast } = useToast()

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await notificationService.getAll({ page, limit: 20 })
      setNotifications(data.data)
      setTotalPages(data.totalPages)
      setUnreadCount(data.unreadCount)
    } catch (err) { addToast('Failed to load', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchNotifications() }, [page])

  const handleMarkRead = async (id) => {
    try { await notificationService.markRead(id); fetchNotifications() }
    catch (err) { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    try { await notificationService.markAllRead(); addToast('Marked all as read', 'success'); fetchNotifications() }
    catch (err) { addToast('Failed', 'error') }
  }

  const handleDelete = async (id) => {
    try { await notificationService.delete(id); fetchNotifications() }
    catch (err) { addToast('Failed', 'error') }
  }

  const typeIcons = {
    membership_expiry: FiCalendar,
    payment_pending: FiAlertTriangle,
    welcome: FiInfo,
    announcement: FiBell,
    attendance: FiCheck,
    workout: FiBell,
    diet: FiBell,
    general: FiInfo,
  }

  const typeColors = {
    membership_expiry: 'text-warning bg-warning/10',
    payment_pending: 'text-danger bg-danger/10',
    welcome: 'text-success bg-success/10',
    announcement: 'text-primary bg-primary/10',
    general: 'text-gray-500 bg-gray-100 dark:bg-gray-700',
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-gray-500 mt-1">{unreadCount} unread notifications</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors">
            <FiCheckSquare /> Mark All Read
          </button>
        )}
      </div>

      {loading ? <Spinner size="lg" className="mt-10" /> : (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiBell className="text-4xl mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : notifications.map(notification => {
            const Icon = typeIcons[notification.type] || FiBell
            const colorClass = typeColors[notification.type] || typeColors.general
            return (
              <div key={notification._id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-colors ${notification.isRead ? 'border-gray-100 dark:border-gray-700' : 'border-primary/20 bg-primary/[0.02]'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{notification.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {!notification.isRead && <button onClick={() => handleMarkRead(notification._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiCheck className="text-success text-sm" /></button>}
                        <button onClick={() => handleDelete(notification._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiTrash2 className="text-danger text-sm" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )
          })}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
