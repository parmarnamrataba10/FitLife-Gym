import { useState, useEffect } from 'react'
import { attendanceService } from '../services/attendanceService'
import { memberService } from '../services/memberService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import { FiCheckCircle, FiXCircle, FiClock, FiTrash2 } from 'react-icons/fi'

export default function Attendance() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState(null)
  const { addToast } = useToast()

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await attendanceService.getAll(params)
      setRecords(data.data)
      setTotalPages(data.totalPages)
    } catch (err) { addToast('Failed to load', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchAttendance()
    attendanceService.getToday().then(({ data }) => setSummary(data.data.summary)).catch(() => {})
    memberService.getAll({ limit: 200 }).then(({ data }) => setMembers(data.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchAttendance() }, [page, statusFilter])
  useEffect(() => { const t = setTimeout(() => { setPage(1); fetchAttendance() }, 500); return () => clearTimeout(t) }, [search])

  const handleMark = async (memberId, status) => {
    try {
      await attendanceService.mark({ memberId, status })
      addToast(`Attendance marked as ${status}`, 'success')
      fetchAttendance()
      const { data } = await attendanceService.getToday()
      setSummary(data.data.summary)
    } catch (err) { addToast(err.message || 'Failed', 'error') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return
    try {
      await attendanceService.delete(id)
      addToast('Attendance record deleted', 'success')
      fetchAttendance()
    } catch (err) { addToast(err.message || 'Failed to delete', 'error') }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-success">{summary?.present || 0}</p>
          <p className="text-sm text-gray-500">Present</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-warning">{summary?.late || 0}</p>
          <p className="text-sm text-gray-500">Late</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-danger">{summary?.absent || 0}</p>
          <p className="text-sm text-gray-500">Absent</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search members..." /></div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"><option value="">All</option><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option></select>
      </div>

      {(user?.role === 'admin' || user?.role === 'trainer') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Mark Attendance</h3>
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 20).map(m => (
              <div key={m._id} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">{m.user?.name?.split(' ')[0]}</span>
                <button onClick={() => handleMark(m._id, 'present')} className="p-0.5 hover:text-success"><FiCheckCircle className="text-xs" /></button>
                <button onClick={() => handleMark(m._id, 'absent')} className="p-0.5 hover:text-danger"><FiXCircle className="text-xs" /></button>
                <button onClick={() => handleMark(m._id, 'late')} className="p-0.5 hover:text-warning"><FiClock className="text-xs" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? <Spinner size="lg" className="mt-10" /> : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check In</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check Out</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  {(user?.role === 'admin' || user?.role === 'trainer') && (
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {records.length === 0 ? <tr><td colSpan={user?.role === 'member' ? 5 : 6} className="text-center py-12 text-gray-400">No records</td></tr> :
                  records.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{r.member?.user?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{r.checkIn || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{r.checkOut || '-'}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      {(user?.role === 'admin' || user?.role === 'trainer') && (
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(r._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Delete">
                            <FiTrash2 className="text-danger" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  )
}
