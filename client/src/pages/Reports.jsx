import { useState } from 'react'
import { reportService } from '../services/reportService'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import { FiFileText, FiDownload, FiUsers, FiDollarSign, FiCalendar, FiTrendingUp, FiCreditCard } from 'react-icons/fi'

const reportTypes = [
  { key: 'members', label: 'Member Report', icon: FiUsers, desc: 'List of all members with filters' },
  { key: 'payments', label: 'Payment Report', icon: FiDollarSign, desc: 'All payment transactions' },
  { key: 'attendance', label: 'Attendance Report', icon: FiCalendar, desc: 'Attendance records' },
  { key: 'revenue', label: 'Revenue Report', icon: FiTrendingUp, desc: 'Revenue analytics' },
  { key: 'membership', label: 'Membership Report', icon: FiCreditCard, desc: 'Membership statistics' },
]

export default function Reports() {
  const [activeReport, setActiveReport] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})
  const { addToast } = useToast()

  const fetchReport = async (type) => {
    setLoading(true)
    setActiveReport(type)
    setData(null)
    try {
      const serviceMap = { members: 'getMembers', payments: 'getPayments', attendance: 'getAttendance', revenue: 'getRevenue', membership: 'getMembership' }
      const { data } = await reportService[serviceMap[type]](filters)
      setData(data)
    } catch (err) { addToast('Failed to load report', 'error') }
    finally { setLoading(false) }
  }

  const downloadCSV = async (type) => {
    try {
      const serviceMap = { members: 'getMembers', payments: 'getPayments', attendance: 'getAttendance' }
      const { data } = await reportService[serviceMap[type]]({ ...filters, format: 'csv' })
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${type}-report.csv`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { addToast('Download failed', 'error') }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {reportTypes.map(r => (
          <button key={r.key} onClick={() => fetchReport(r.key)} className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border text-left hover:border-primary transition-colors ${activeReport === r.key ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 dark:border-gray-700'}`}>
            <r.icon className="text-2xl text-primary mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{r.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
          </button>
        ))}
      </div>

      {filters && activeReport && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 items-center">
          <input type="date" onChange={e => setFilters({...filters, startDate: e.target.value})} className="px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Start date" />
          <input type="date" onChange={e => setFilters({...filters, endDate: e.target.value})} className="px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="End date" />
          <button onClick={() => fetchReport(activeReport)} className="px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark">Apply Filters</button>
          <button onClick={() => downloadCSV(activeReport)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"><FiDownload /> Export CSV</button>
        </div>
      )}

      {loading && <Spinner size="lg" className="mt-10" />}

      {data && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          {data.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(data.summary).filter(([, val]) => typeof val === 'number' || typeof val === 'string').map(([key, val]) => (
                <div key={key} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{typeof val === 'number' ? val.toLocaleString() : val}</p>
                  <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
              ))}
              {data.summary.byMethod && typeof data.summary.byMethod === 'object' && (
                <div className="col-span-full grid grid-cols-3 gap-4 mt-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                  {Object.entries(data.summary.byMethod).map(([method, count]) => (
                    <div key={method} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                      <p className="text-xs text-gray-500 capitalize">{method}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {data.planDistribution && typeof data.planDistribution === 'object' && Object.keys(data.planDistribution).length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Plan Distribution</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.planDistribution).map(([name, count]) => (
                  <div key={name} className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-xs text-gray-500">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(data.data) && data.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    {Object.keys(data.data[0]).filter(k => !k.startsWith('_') && k !== '__v').slice(0, 6).map(k => <th key={k} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{k.replace(/([A-Z])/g, ' $1').trim()}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.data.slice(0, 50).map((item, idx) => (
                    <tr key={idx}>
                      {Object.entries(item).filter(([k]) => !k.startsWith('_') && k !== '__v').slice(0, 6).map(([k, v]) => (
                        <td key={k} className="px-3 py-2 text-gray-600 dark:text-gray-400">
                          {v === null || v === undefined ? '' :
                           k === 'amount' || k === 'total' || k === 'totalAmount' || k === 'averageTransaction' ? `₹${Number(v).toLocaleString()}` :
                           k === 'totalRevenue' ? `₹${Number(v).toLocaleString()}` :
                           k === 'date' || k === 'paymentDate' || k === 'joiningDate' ? new Date(v).toLocaleDateString() :
                           k === 'status' || k === 'paymentMethod' || k === 'gender' ? String(v) :
                           typeof v === 'object' && v !== null ? (
                             v.name || v.user?.name || JSON.stringify(v).slice(0, 30)
                           ) : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : Array.isArray(data.data) && data.data.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No data available for this report</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
