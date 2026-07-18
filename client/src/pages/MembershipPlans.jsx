import { useState, useEffect } from 'react'
import { planService } from '../services/planService'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import { FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi'

const initialForm = { name: '', price: '', duration: '', durationType: 'months', features: [''], description: '', freezeDays: 0, discount: 0 }

export default function MembershipPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const fetchPlans = async () => {
    try {
      const { data } = await planService.getAll({ limit: 50 })
      setPlans(data.data)
    } catch (err) {
      addToast('Failed to load plans', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlans() }, [])

  const handleEdit = (plan) => {
    setEditing(plan._id)
    setForm({ name: plan.name, price: plan.price, duration: plan.duration, durationType: plan.durationType, features: plan.features?.length ? plan.features : [''], description: plan.description || '', freezeDays: plan.freezeDays || 0, discount: plan.discount || 0 })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, features: form.features.filter(f => f.trim()) }
      if (editing) { await planService.update(editing, data); addToast('Plan updated', 'success') }
      else { await planService.create(data); addToast('Plan created', 'success') }
      setShowModal(false); fetchPlans()
    } catch (err) { addToast(err.message || 'Failed', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this plan?')) return
    try { await planService.delete(id); addToast('Plan deactivated', 'success'); fetchPlans() }
    catch (err) { addToast(err.message || 'Failed', 'error') }
  }

  const addFeature = () => setForm({ ...form, features: [...form.features, ''] })
  const removeFeature = (idx) => setForm({ ...form, features: form.features.filter((_, i) => i !== idx) })

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Membership Plans</h1>
        <button onClick={() => { setEditing(null); setForm(initialForm); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium"><FiPlus /> Add Plan</button>
      </div>
      {loading ? <Spinner size="lg" className="mt-10" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative">
              <div className="absolute top-4 right-4 flex gap-1">
                <button onClick={() => handleEdit(plan)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiEdit2 className="text-gray-400 text-sm" /></button>
                <button onClick={() => handleDelete(plan._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiTrash2 className="text-danger text-sm" /></button>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="text-3xl font-bold text-primary mt-2">₹{plan.price?.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/{plan.durationType === 'days' ? 'day' : plan.durationType === 'years' ? 'year' : 'month'}</span></p>
              <p className="text-sm text-gray-500 mt-1">{plan.duration} {plan.durationType}</p>
              {plan.discount > 0 && <p className="text-sm text-success mt-1">{plan.discount}% off</p>}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {plan.features?.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><FiCheck className="text-success flex-shrink-0" /> {f}</li>)}
              </ul>
              {plan.freezeDays > 0 && <p className="text-xs text-gray-400 mt-3">{plan.freezeDays} freeze days allowed</p>}
            </div>
          ))}
          {plans.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No plans created yet</div>}
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Plan' : 'Add Plan'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label><input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label><input type="number" required value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration Type</label><select value={form.durationType} onChange={e => setForm({...form, durationType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"><option value="days">Days</option><option value="months">Months</option><option value="years">Years</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Freeze Days</label><input type="number" value={form.freezeDays} onChange={e => setForm({...form, freezeDays: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount (%)</label><input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</label>
            {form.features.map((f, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={f} onChange={e => { const features = [...form.features]; features[idx] = e.target.value; setForm({...form, features }) }} placeholder="Feature" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                {form.features.length > 1 && <button type="button" onClick={() => removeFeature(idx)} className="px-3 py-2 text-danger hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">✕</button>}
              </div>
            ))}
            <button type="button" onClick={addFeature} className="text-sm text-primary hover:underline">+ Add Feature</button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
