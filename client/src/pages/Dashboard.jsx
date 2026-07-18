import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../services/dashboardService'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { FiUsers, FiUserCheck, FiDollarSign, FiCalendar, FiTrendingUp, FiClock, FiAlertCircle, FiChevronRight } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="text-xl text-white" />
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getChartData()
        ])
        setStats(statsRes.data.data)
        setCharts(chartsRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Spinner size="lg" className="mt-20" />

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const revenueData = charts?.monthlyRevenue?.map(r => ({
    name: monthNames[r._id.month - 1],
    revenue: r.total
  })) || []

  const joiningData = charts?.monthlyJoinings?.map(r => ({
    name: monthNames[r._id.month - 1],
    joinings: r.count
  })) || []

  const statusData = charts?.memberStatusDistribution?.map(s => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count
  })) || []

  const planData = charts?.planDistribution?.map(p => ({
    name: p.planName || 'Unknown',
    value: p.count
  })) || []

  const formatCurrency = (amount) => `₹${amount?.toLocaleString() || 0}`

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members" value={stats?.totalMembers || 0} icon={FiUsers} color="bg-primary" />
        <StatCard title="Active Members" value={stats?.activeMembers || 0} icon={FiUserCheck} color="bg-success" />
        <StatCard title="Today's Attendance" value={stats?.todayAttendance || 0} icon={FiCalendar} color="bg-warning" />
        <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue)} icon={FiDollarSign} color="bg-secondary" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Expired Members" value={stats?.expiredMembers || 0} icon={FiClock} color="bg-danger" subtitle="Need renewal" />
        <StatCard title="Pending Payments" value={stats?.pendingPayments || 0} icon={FiAlertCircle} color="bg-warning" />
        <StatCard title="Today's Joining" value={stats?.todayJoinings || 0} icon={FiTrendingUp} color="bg-success" />
        <StatCard title="Active Plans" value={stats?.totalPlans || 0} icon={FiDollarSign} color="bg-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No revenue data yet</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Joinings</h3>
          {joiningData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={joiningData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="joinings" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No joining data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Member Status</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">No member data yet</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan Distribution</h3>
          {planData.length > 0 ? (
            <div className="space-y-3">
              {planData.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{p.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">No plan data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Members</h3>
            <Link to="/members" className="text-sm text-primary hover:underline flex items-center gap-1">View All <FiChevronRight /></Link>
          </div>
          <div className="p-5">
            {stats?.recentMembers?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentMembers.map(member => (
                  <Link key={member._id} to={`/members/${member._id}`} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                      {member.user?.name?.charAt(0)?.toUpperCase() || 'M'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.user?.name}</p>
                      <p className="text-xs text-gray-500">{member.membershipPlan?.name || 'No Plan'} • {member.status}</p>
                    </div>
                    <StatusBadge status={member.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6">No members yet</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
            <Link to="/payments" className="text-sm text-primary hover:underline flex items-center gap-1">View All <FiChevronRight /></Link>
          </div>
          <div className="p-5">
            {stats?.recentPayments?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPayments.map(payment => (
                  <div key={payment._id} className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success text-sm font-semibold">
                      ₹
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{payment.member?.user?.name}</p>
                      <p className="text-xs text-gray-500">{payment.invoiceNumber} • {new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{payment.amount?.toLocaleString()}</p>
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6">No payments yet</p>
            )}
          </div>
        </div>
      </div>

      {stats?.upcomingExpiries?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-danger flex items-center gap-2">
              <FiAlertCircle /> Upcoming Expiries (Next 7 Days)
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.upcomingExpiries.map(member => (
                <Link key={member._id} to={`/members/${member._id}`} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger text-sm font-semibold">
                    {member.user?.name?.charAt(0)?.toUpperCase() || 'M'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.user?.name}</p>
                    <p className="text-xs text-danger">Expires: {new Date(member.expiryDate).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
