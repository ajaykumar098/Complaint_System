import { Outlet } from 'react-router-dom'
import Background3D from '../components/Background3D'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Background3D />
      <div className="relative z-10 w-full max-w-5xl">
        <Outlet />
      </div>
    </div>
  )
}
