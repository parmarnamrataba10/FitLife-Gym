import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { dark, toggleTheme } = useTheme()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
            <p className="text-sm text-gray-500">Toggle dark mode theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}
