import { useState, useEffect } from 'react'
import { dietService } from '../services/dietService'
import { memberService } from '../services/memberService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import { FiPlus, FiEdit2, FiTrash2, FiCoffee } from 'react-icons/fi'

const initialForm = { name: '', description: '', goal: 'general', meals: [{ name: '', time: '', items: [''], calories: 0, protein: 0, carbs: 0, fat: 0, notes: '' }] }

export default function Diets() {
  const { user } = useAuth()
  const [diets, setDiets] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    dietService.getAll({ limit: 50 }).then(({ data }) => setDiets(data.data)).catch(() => {}).finally(() => setLoading(false))
    memberService.getAll({ limit: 200 }).then(({ data }) => setMembers(data.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) { await dietService.update(editing, form); addToast('Updated', 'success') }
      else { await dietService.create(form); addToast('Created', 'success') }
      setShowModal(false); const { data } = await dietService.getAll({ limit: 50 }); setDiets(data.data)
    } catch (err) { addToast(err.message || 'Failed', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diet plan?')) return
    try { await dietService.delete(id); addToast('Deleted', 'success'); const { data } = await dietService.getAll({ limit: 50 }); setDiets(data.data) }
    catch (err) { addToast(err.message || 'Failed', 'error') }
  }

  const handleAssign = async (dietId, memberId) => {
    try { await dietService.assign(dietId, { memberId }); addToast('Assigned', 'success') }
    catch (err) { addToast(err.message || 'Failed', 'error') }
  }

  const addMeal = () => setForm({ ...form, meals: [...form.meals, { name: '', time: '', items: [''], calories: 0, protein: 0, carbs: 0, fat: 0, notes: '' }] })
  const removeMeal = (idx) => setForm({ ...form, meals: form.meals.filter((_, i) => i !== idx) })
  const updateMeal = (idx, field, value) => {
    const meals = [...form.meals]
    meals[idx] = { ...meals[idx], [field]: value }
    setForm({ ...form, meals })
  }
  const addItem = (mealIdx) => { const meals = [...form.meals]; meals[mealIdx] = { ...meals[mealIdx], items: [...meals[mealIdx].items, ''] }; setForm({ ...form, meals }) }
  const updateItem = (mealIdx, itemIdx, value) => { const meals = [...form.meals]; meals[mealIdx].items[itemIdx] = value; setForm({ ...form, meals }) }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Diet Plans</h1>
        {(user?.role === 'admin' || user?.role === 'trainer') && <button onClick={() => { setEditing(null); setForm(initialForm); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium"><FiPlus /> Create Diet Plan</button>}
      </div>
      {loading ? <Spinner size="lg" className="mt-10" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diets.map(d => (
            <div key={d._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3"><FiCoffee className="text-primary text-xl" /><div><h3 className="font-semibold text-gray-900 dark:text-white">{d.name}</h3><p className="text-xs text-gray-500 capitalize">{d.goal.replace('_', ' ')} • {d.totalCalories} cal</p></div></div>
                {(user?.role === 'admin' || user?.role === 'trainer') && <div className="flex gap-1"><button onClick={() => { setEditing(d._id); setForm({ name: d.name, description: d.description, goal: d.goal, meals: d.meals?.length ? d.meals : initialForm.meals }); setShowModal(true) }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiEdit2 className="text-gray-400 text-sm" /></button><button onClick={() => handleDelete(d._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiTrash2 className="text-danger text-sm" /></button></div>}
              </div>
              <div className="mt-4 space-y-2">
                {d.meals?.map((m, i) => <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"><p className="text-sm font-medium text-gray-900 dark:text-white">{m.name} <span className="text-xs text-gray-500">({m.time})</span></p><p className="text-xs text-gray-500">{m.calories} cal • P:{m.protein}g C:{m.carbs}g F:{m.fat}g</p></div>)}
              </div>
              {user?.role === 'admin' && <div className="mt-3"><select onChange={e => e.target.value && handleAssign(d._id, e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="">Assign to member...</option>{members.map(m => <option key={m._id} value={m._id}>{m.user?.name}</option>)}</select></div>}
            </div>
          ))}
          {diets.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No diet plans created yet</div>}
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Diet Plan' : 'Create Diet Plan'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal</label><select value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="weight_loss">Weight Loss</option><option value="weight_gain">Weight Gain</option><option value="maintenance">Maintenance</option><option value="muscle_building">Muscle Building</option><option value="general">General</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meals</label>
            {form.meals.map((meal, idx) => (
              <div key={idx} className="p-3 mb-2 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  <input type="text" placeholder="Meal name" value={meal.name} onChange={e => updateMeal(idx, 'name', e.target.value)} className="px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-700" />
                  <input type="time" value={meal.time} onChange={e => updateMeal(idx, 'time', e.target.value)} className="px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-700" />
                  <input type="number" placeholder="Calories" value={meal.calories} onChange={e => updateMeal(idx, 'calories', e.target.value)} className="px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-700" />
                </div>
                <div className="flex gap-2 mb-2">{['protein','carbs','fat'].map(f => <input key={f} type="number" placeholder={f} value={meal[f]} onChange={e => updateMeal(idx, f, e.target.value)} className="flex-1 px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-700" />)}</div>
                {meal.items.map((item, i) => <div key={i} className="flex gap-1 mb-1"><input type="text" placeholder="Food item" value={item} onChange={e => updateItem(idx, i, e.target.value)} className="flex-1 px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700" /></div>)}
                <button type="button" onClick={() => addItem(idx)} className="text-xs text-primary hover:underline mr-3">+ Item</button>
                {form.meals.length > 1 && <button type="button" onClick={() => removeMeal(idx)} className="text-xs text-danger">Remove meal</button>}
              </div>
            ))}
            <button type="button" onClick={addMeal} className="text-sm text-primary hover:underline">+ Add Meal</button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
