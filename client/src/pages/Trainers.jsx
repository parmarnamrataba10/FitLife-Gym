import { useState, useEffect } from 'react'
import { trainerService } from '../services/trainerService'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

const initialForm = {
  name: '', email: '', phone: '', password: 'trainer123',
  specialization: '', experience: '', salary: '',
  shiftTiming: { start: '08:00', end: '17:00' },
  certifications: '', bio: ''
}

export default function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const fetchTrainers = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      const { data } = await trainerService.getAll(params)
      setTrainers(data.data)
      setTotalPages(data.totalPages)
    } catch (err) {
      addToast(err.message || 'Failed to load trainers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrainers() }, [page])
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchTrainers() }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const handleEdit = (trainer) => {
    setEditing(trainer._id)
    setForm({
      name: trainer.user?.name || '',
      email: trainer.user?.email || '',
      phone: trainer.user?.phone || '',
      password: '',
      specialization: trainer.specialization || '',
      experience: trainer.experience || '',
      salary: trainer.salary || '',
      shiftTiming: trainer.shiftTiming || { start: '08:00', end: '17:00' },
      certifications: trainer.certifications || '',
      bio: trainer.bio || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await trainerService.update(editing, form)
        addToast('Trainer updated', 'success')
      } else {
        await trainerService.create(form)
        addToast('Trainer created', 'success')
      }
      setShowModal(false)
      fetchTrainers()
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this trainer?')) return
    try {
      await trainerService.delete(id)
      addToast('Trainer deactivated', 'success')
      fetchTrainers()
    } catch (err) {
      addToast(err.message || 'Failed', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trainers</h1>
        <button onClick={() => { setEditing(null); setForm(initialForm); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium"><FiPlus /> Add Trainer</button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search trainers..." />
      {loading ? <Spinner size="lg" className="mt-10" /> : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trainer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Specialization</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Experience</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Shift</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Members</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {trainers.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No trainers found</td></tr> :
                  trainers.map(t => (
                    <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">{t.user?.name?.charAt(0)}</div>
                          <div><p className="text-sm font-medium text-gray-900 dark:text-white">{t.user?.name}</p><p className="text-xs text-gray-500">{t.user?.email}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t.specialization}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t.experience} yrs</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t.shiftTiming?.start} - {t.shiftTiming?.end}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t.assignedMembers?.length || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEdit(t)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiEdit2 className="text-gray-500" /></button>
                        <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiTrash2 className="text-danger" /></button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-700"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Trainer' : 'Add Trainer'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            {!editing && <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>}
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label><input type="text" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (years)</label><input type="number" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary</label><input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift Start</label><input type="time" value={form.shiftTiming.start} onChange={e => setForm({...form, shiftTiming: {...form.shiftTiming, start: e.target.value}})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift End</label><input type="time" value={form.shiftTiming.end} onChange={e => setForm({...form, shiftTiming: {...form.shiftTiming, end: e.target.value}})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label><textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
