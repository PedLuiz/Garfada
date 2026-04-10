import { Outlet } from 'react-router-dom'
import { AppNavbar } from '../components/common/AppNavbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
