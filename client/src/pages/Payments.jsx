import { useState, useEffect } from 'react'
import { paymentService } from '../services/paymentService'
import { memberService } from '../services/memberService'
import { planService } from '../services/planService'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ memberId: '', planId: '', amount: '', paymentMethod: 'cash', description: '' })
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      const { data } = await paymentService.getAll(params)
      setPayments(data.data)
      setTotalPages(data.totalPages)
    } catch (err) { addToast('Failed to load payments', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPayments() }, [page])
  useEffect(() => { const t = setTimeout(() => { setPage(1); fetchPayments() }, 500); return () => clearTimeout(t) }, [search])

  useEffect(() => {
    memberService.getAll({ limit: 100 }).then(({ data }) => setMembers(data.data)).catch(() => {})
    planService.getAll({ limit: 50 }).then(({ data }) => setPlans(data.data)).catch(() => {})
  }, [])

  const handlePlanChange = (planId) => {
    const plan = plans.find(p => p._id === planId)
    setForm({ ...form, planId, amount: plan?.price || '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        amount: Number(form.amount) || 0
      }
      await paymentService.create(payload)
      addToast('Payment recorded successfully', 'success')
      setShowModal(false)
      fetchPayments()
    } catch (err) { addToast(err.response?.data?.message || err.message || 'Failed to record payment', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record? This cannot be undone.')) return
    try {
      await paymentService.delete(id)
      addToast('Payment deleted', 'success')
      fetchPayments()
    } catch (err) { addToast(err.message || 'Failed to delete', 'error') }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <button onClick={() => { setForm({ memberId: '', planId: '', amount: '', paymentMethod: 'cash', description: '' }); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium"><FiPlus /> Record Payment</button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search payments..." />
      {loading ? <Spinner size="lg" className="mt-10" /> : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {payments.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No payments found</td></tr> :
                  payments.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{p.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.member?.user?.name}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">₹{p.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{p.paymentMethod}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Delete">
                          <FiTrash2 className="text-danger" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-700"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member</label>
            <select required value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Select Member</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.user?.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
            <select value={form.planId} onChange={e => handlePlanChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Select Plan (auto-fills amount)</option>
              {plans.map(p => <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label><input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
            <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50">{saving ? 'Recording...' : 'Record Payment'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
