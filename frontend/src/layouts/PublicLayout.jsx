import { Link, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
          <Link to="/" className="font-display text-2xl font-semibold text-[var(--accent)]">
            Garfada
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
