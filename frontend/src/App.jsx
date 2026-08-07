import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminComplaintDetails from './pages/admin/AdminComplaintDetails'
import ReportComplaint from './pages/ReportComplaint'
import MyComplaints from './pages/MyComplaints'
import ComplaintDetails from './pages/ComplaintDetails'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import AIAssistant from './pages/AIAssistant'
import Help from './pages/Help'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<ReportComplaint />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
            <Route path="/complaints/:complaintId" element={<ComplaintDetails />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/help" element={<Help />} />
          </Route>

          <Route
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints/:complaintId" element={<AdminComplaintDetails />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
