import { useState, useEffect } from 'react'
import { workoutService } from '../services/workoutService'
import { memberService } from '../services/memberService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import { FiPlus, FiEdit2, FiTrash2, FiActivity } from 'react-icons/fi'

const initialForm = { name: '', description: '', duration: '45 min', difficulty: 'intermediate', dayOfWeek: 'monday', exercises: [{ name: '', sets: 3, reps: '10-12', weight: '', duration: '', restTime: '60s', notes: '' }] }

export default function Workouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    workoutService.getAll({ limit: 50 }).then(({ data }) => setWorkouts(data.data)).catch(() => {}).finally(() => setLoading(false))
    memberService.getAll({ limit: 200 }).then(({ data }) => setMembers(data.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) { await workoutService.update(editing, form); addToast('Updated', 'success') }
      else { await workoutService.create(form); addToast('Created', 'success') }
      setShowModal(false); const { data } = await workoutService.getAll({ limit: 50 }); setWorkouts(data.data)
    } catch (err) { addToast(err.message || 'Failed', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout?')) return
    try { await workoutService.delete(id); addToast('Deleted', 'success'); const { data } = await workoutService.getAll({ limit: 50 }); setWorkouts(data.data) }
    catch (err) { addToast(err.message || 'Failed', 'error') }
  }

  const handleAssign = async (workoutId, memberId) => {
    try { await workoutService.assign(workoutId, { memberId }); addToast('Assigned', 'success') }
    catch (err) { addToast(err.message || 'Failed', 'error') }
  }

  const addExercise = () => setForm({ ...form, exercises: [...form.exercises, { name: '', sets: 3, reps: '10-12', weight: '', duration: '', restTime: '60s', notes: '' }] })
  const removeExercise = (idx) => setForm({ ...form, exercises: form.exercises.filter((_, i) => i !== idx) })
  const updateExercise = (idx, field, value) => {
    const exercises = [...form.exercises]
    exercises[idx] = { ...exercises[idx], [field]: value }
    setForm({ ...form, exercises })
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Plans</h1>
        {(user?.role === 'admin' || user?.role === 'trainer') && <button onClick={() => { setEditing(null); setForm(initialForm); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium"><FiPlus /> Create Workout</button>}
      </div>
      {loading ? <Spinner size="lg" className="mt-10" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workouts.map(w => (
            <div key={w._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3"><FiActivity className="text-primary text-xl" /><div><h3 className="font-semibold text-gray-900 dark:text-white">{w.name}</h3><p className="text-xs text-gray-500">{w.difficulty} • {w.duration} • {w.dayOfWeek}</p></div></div>
                {(user?.role === 'admin' || user?.role === 'trainer') && <div className="flex gap-1"><button onClick={() => { setEditing(w._id); setForm({ name: w.name, description: w.description, duration: w.duration, difficulty: w.difficulty, dayOfWeek: w.dayOfWeek, exercises: w.exercises?.length ? w.exercises : [{ name: '', sets: 3, reps: '10-12', weight: '', duration: '', restTime: '60s', notes: '' }] }); setShowModal(true) }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiEdit2 className="text-gray-400 text-sm" /></button><button onClick={() => handleDelete(w._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiTrash2 className="text-danger text-sm" /></button></div>}
              </div>
              <div className="mt-4 space-y-2">
                {w.exercises?.slice(0, 5).map((ex, i) => <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"><span className="text-gray-900 dark:text-white font-medium">{ex.name}</span><span className="text-gray-500">{ex.sets}x{ex.reps} {ex.weight && `• ${ex.weight}`}</span></div>)}
                {w.exercises?.length > 5 && <p className="text-xs text-gray-400">+{w.exercises.length - 5} more exercises</p>}
              </div>
              {user?.role === 'admin' && (
                <div className="mt-3"><select onChange={e => e.target.value && handleAssign(w._id, e.target.value)} className="w-full text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="">Assign to member...</option>{members.map(m => <option key={m._id} value={m._id}>{m.user?.name}</option>)}</select></div>
              )}
            </div>
          ))}
          {workouts.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No workouts created yet</div>}
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Workout' : 'Create Workout'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label><input type="text" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label><select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label><select value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">{['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exercises</label>
            {form.exercises.map((ex, idx) => (
              <div key={idx} className="p-3 mb-2 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input type="text" placeholder="Exercise name" value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} className="px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="number" placeholder="Sets" value={ex.sets} onChange={e => updateExercise(idx, 'sets', e.target.value)} className="px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="text" placeholder="Reps" value={ex.reps} onChange={e => updateExercise(idx, 'reps', e.target.value)} className="px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="text" placeholder="Weight" value={ex.weight} onChange={e => updateExercise(idx, 'weight', e.target.value)} className="px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                {form.exercises.length > 1 && <button type="button" onClick={() => removeExercise(idx)} className="mt-1 text-xs text-danger">Remove</button>}
              </div>
            ))}
            <button type="button" onClick={addExercise} className="text-sm text-primary hover:underline">+ Add Exercise</button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
