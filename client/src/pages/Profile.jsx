import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-3 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">{user?.role}</span>
          </div>
        </div>
        <p className="text-gray-500">Profile settings will be available in later steps.</p>
      </div>
    </div>
  )
}
