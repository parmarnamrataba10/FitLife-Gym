import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import MemberProfile from './pages/MemberProfile'
import Trainers from './pages/Trainers'
import MembershipPlans from './pages/MembershipPlans'
import Payments from './pages/Payments'
import Attendance from './pages/Attendance'
import Workouts from './pages/Workouts'
import Diets from './pages/Diets'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="members" element={<Members />} />
              <Route path="members/:id" element={<MemberProfile />} />
              <Route path="trainers" element={<Trainers />} />
              <Route path="plans" element={<MembershipPlans />} />
              <Route path="payments" element={<Payments />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="workouts" element={<Workouts />} />
              <Route path="diets" element={<Diets />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
