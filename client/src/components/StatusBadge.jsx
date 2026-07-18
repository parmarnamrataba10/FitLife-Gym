export default function StatusBadge({ status }) {
  const statusStyles = {
    active: 'bg-success/10 text-success border-success/20',
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600',
    suspended: 'bg-warning/10 text-warning border-warning/20',
    expired: 'bg-danger/10 text-danger border-danger/20',
    present: 'bg-success/10 text-success border-success/20',
    absent: 'bg-danger/10 text-danger border-danger/20',
    late: 'bg-warning/10 text-warning border-warning/20',
    paid: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    cancelled: 'bg-danger/10 text-danger border-danger/20',
    basic: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    standard: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    premium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  }

  const style = statusStyles[status?.toLowerCase()] || statusStyles.active

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  )
}
