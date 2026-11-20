import { Outlet } from 'react-router-dom'
import Background3D from '../components/Background3D'
import Navbar from '../components/Navbar'
import AIChatWidget from '../components/AIChatWidget'

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      <Background3D />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
      <AIChatWidget />
    </div>
  )
}
