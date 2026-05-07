import { Link, Outlet, useLocation } from 'react-router-dom'
import logoGarfada from '../assets/logo-garfada.png'

export function PublicLayout() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  if (isLanding) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-semibold text-[var(--accent)]">
            <img src={logoGarfada} alt="" aria-hidden="true" className="size-10 object-contain" />
            <span>Garfada</span>
          </Link>
          <p className="text-sm text-[var(--text-secondary)]">Descubra. Avalie. Compartilhe.</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-6 lg:py-12">
        <Outlet />
      </main>
    </div>
  )
}
