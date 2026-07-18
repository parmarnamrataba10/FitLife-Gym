import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { memberService } from '../services/memberService'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCalendar, FiActivity, FiCoffee, FiDollarSign } from 'react-icons/fi'

export default function MemberProfile() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data } = await memberService.getById(id)
        setData(data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMember()
  }, [id])

  if (loading) return <Spinner size="lg" className="mt-20" />
  if (!data) return <p className="text-center text-gray-400 mt-20">Member not found</p>

  const { member, payments, attendance, workouts, diets } = data

  return (
    <div className="space-y-6 animate-fadeIn">
      <Link to="/members" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
        <FiArrowLeft /> Back to Members
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
            {member.user?.name?.charAt(0)?.toUpperCase() || 'M'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{member.user?.name}</h1>
              <StatusBadge status={member.status} />
            </div>
            <p className="text-gray-500 capitalize">{member.gender} • {member.age} years</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Member since</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(member.joiningDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <FiMail className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{member.user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiPhone className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{member.user?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiMapPin className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{member.address || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiActivity className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Height: {member.height}cm • Weight: {member.weight}kg</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Membership</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plan</span>
                <span className="text-gray-900 dark:text-white font-medium">{member.membershipPlan?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Expiry</span>
                <span className="text-gray-900 dark:text-white font-medium">{member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Trainer</span>
                <span className="text-gray-900 dark:text-white font-medium">{member.assignedTrainer?.user?.name || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          {member.medicalCondition && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Medical Condition</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{member.medicalCondition}</p>
            </div>
          )}

          {member.emergencyContact?.name && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-900 dark:text-white">{member.emergencyContact.name}</p>
                <p className="text-gray-500">{member.emergencyContact.phone}</p>
                <p className="text-gray-500">{member.emergencyContact.relation}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {workouts?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiActivity className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workout Plans</h3>
              </div>
              <div className="space-y-3">
                {workouts.map(w => (
                  <div key={w._id} className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900 dark:text-white">{w.name}</p>
                      <StatusBadge status={w.difficulty} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{w.exercises?.length || 0} exercises • {w.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diets?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiCoffee className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Diet Plans</h3>
              </div>
              <div className="space-y-3">
                {diets.map(d => (
                  <div key={d._id} className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white">{d.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{d.meals?.length || 0} meals • {d.totalCalories} cal</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiDollarSign className="text-success" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
            </div>
            {payments?.length > 0 ? (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p._id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(p.paymentDate).toLocaleDateString()} • {p.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{p.amount?.toLocaleString()}</p>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No payments yet</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiCalendar className="text-warning" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Attendance</h3>
            </div>
            {attendance?.length > 0 ? (
              <div className="space-y-3">
                {attendance.slice(0, 10).map(a => (
                  <div key={a._id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white">{new Date(a.date).toLocaleDateString()}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{a.checkIn || '-'} → {a.checkOut || '-'}</span>
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No attendance records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
