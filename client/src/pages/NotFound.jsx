import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-4">Page Not Found</p>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="inline-block mt-6 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
