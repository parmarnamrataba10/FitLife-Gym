import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiX, FiGrid, FiUsers, FiUserCheck, FiCreditCard, FiDollarSign, FiCalendar, FiActivity, FiCoffee, FiFileText, FiBell, FiUser, FiSettings } from 'react-icons/fi'

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/members', label: 'Members', icon: FiUsers },
  { to: '/trainers', label: 'Trainers', icon: FiUserCheck },
  { to: '/plans', label: 'Plans', icon: FiCreditCard },
  { to: '/payments', label: 'Payments', icon: FiDollarSign },
  { to: '/attendance', label: 'Attendance', icon: FiCalendar },
  { to: '/workouts', label: 'Workouts', icon: FiActivity },
  { to: '/diets', label: 'Diet Plans', icon: FiCoffee },
  { to: '/reports', label: 'Reports', icon: FiFileText },
  { to: '/notifications', label: 'Notifications', icon: FiBell },
]

const trainerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/members', label: 'Members', icon: FiUsers },
  { to: '/attendance', label: 'Attendance', icon: FiCalendar },
  { to: '/workouts', label: 'Workouts', icon: FiActivity },
  { to: '/diets', label: 'Diet Plans', icon: FiCoffee },
  { to: '/notifications', label: 'Notifications', icon: FiBell },
]

const memberLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/members', label: 'Members', icon: FiUsers },
  { to: '/attendance', label: 'Attendance', icon: FiCalendar },
  { to: '/workouts', label: 'My Workouts', icon: FiActivity },
  { to: '/diets', label: 'My Diet', icon: FiCoffee },
  { to: '/payments', label: 'Payments', icon: FiDollarSign },
  { to: '/notifications', label: 'Notifications', icon: FiBell },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'trainer' ? trainerLinks
    : memberLinks

  const bottomLinks = [
    { to: '/profile', label: 'Profile', icon: FiUser },
    { to: '/settings', label: 'Settings', icon: FiSettings },
  ]

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary">FitLife Gym</h1>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiX className="text-xl text-gray-500" />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <link.icon className="text-lg" />
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="pt-4 space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
            {bottomLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <link.icon className="text-lg" />
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}
