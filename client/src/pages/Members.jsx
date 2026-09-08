import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { memberService } from '../services/memberService'
import { planService } from '../services/planService'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiChevronRight, FiUser, FiPhone, FiMail } from 'react-icons/fi'

const initialForm = {
  name: '', email: '', phone: '', password: 'member123',
  age: '', gender: 'male', height: '', weight: '',
  address: '', medicalCondition: '', membershipPlan: '',
  emergencyContact: { name: '', phone: '', relation: '' }
}

export default function Members() {
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10, sort: '-createdAt' }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await memberService.getAll(params)
      setMembers(data.data)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      addToast(err.message || 'Failed to load members', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [page, statusFilter])
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchMembers() }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    planService.getAll({ limit: 50 }).then(({ data }) => setPlans(data.data)).catch(() => {})
  }, [])

  const handleEdit = (member) => {
    setEditing(member._id)
    setForm({
      name: member.user?.name || '',
      email: member.user?.email || '',
      phone: member.user?.phone || '',
      password: '',
      age: member.age || '',
      gender: member.gender || 'male',
      height: member.height || '',
      weight: member.weight || '',
      address: member.address || '',
      medicalCondition: member.medicalCondition || '',
      membershipPlan: member.membershipPlan?._id || member.membershipPlan || '',
      emergencyContact: member.emergencyContact || { name: '', phone: '', relation: '' }
    })
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await memberService.update(editing, form)
        addToast('Member updated successfully', 'success')
      } else {
        await memberService.create(form)
        addToast('Member created successfully', 'success')
      }
      setShowModal(false)
      fetchMembers()
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await memberService.toggleStatus(id)
      addToast('Member status updated', 'success')
      fetchMembers()
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this member and all associated data? This cannot be undone.')) return
    try {
      await memberService.delete(id)
      addToast('Member deleted permanently', 'success')
      fetchMembers()
    } catch (err) {
      addToast(err.message || 'Failed to delete member', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total members</p>
        </div>
        {isAdmin && (
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors text-sm font-medium">
            <FiPlus /> Add Member
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search members..." />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <Spinner size="lg" className="mt-10" />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Expiry</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {members.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No members found</td></tr>
                ) : members.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/members/${member._id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                          {member.user?.name?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{member.user?.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{member.gender} • {member.age} yrs</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"><FiMail className="text-[10px]" /> {member.user?.email}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"><FiPhone className="text-[10px]" /> {member.user?.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white">{member.membershipPlan?.name || 'No Plan'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <>
                            <button onClick={() => handleToggleStatus(member._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Toggle Status">
                              {member.status === 'active' ? <FiToggleRight className="text-success" /> : <FiToggleLeft className="text-gray-400" />}
                            </button>
                            <button onClick={() => handleEdit(member)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Edit">
                              <FiEdit2 className="text-gray-500" />
                            </button>
                            <button onClick={() => handleDelete(member._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Delete">
                              <FiTrash2 className="text-danger" />
                            </button>
                          </>
                        )}
                        <Link to={`/members/${member._id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="View Profile">
                          <FiChevronRight className="text-gray-400" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Member' : 'Add New Member'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
              <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
              <input type="number" value={form.height} onChange={e => setForm({...form, height: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
              <input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membership Plan</label>
              <select value={form.membershipPlan} onChange={e => setForm({...form, membershipPlan: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Select Plan</option>
                {plans.map(p => <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Condition</label>
            <textarea value={form.medicalCondition} onChange={e => setForm({...form, medicalCondition: e.target.value})} rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Name</label>
              <input type="text" value={form.emergencyContact.name} onChange={e => setForm({...form, emergencyContact: {...form.emergencyContact, name: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Phone</label>
              <input type="text" value={form.emergencyContact.phone} onChange={e => setForm({...form, emergencyContact: {...form.emergencyContact, phone: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relation</label>
              <input type="text" value={form.emergencyContact.relation} onChange={e => setForm({...form, emergencyContact: {...form.emergencyContact, relation: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update Member' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
