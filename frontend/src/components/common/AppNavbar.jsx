import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logoGarfada from '../../assets/logo-garfada.png'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/lista-desejos', label: 'Lista de Desejos' },
  { to: '/visitados', label: 'Visitados' },
  { to: '/feed', label: 'Feed' },
  { to: '/meu-perfil', label: 'Meu Perfil' },
]

export function AppNavbar() {
  const { me, logout } = useAuth()

  async function handleLogout() {
    await logout()
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_90%,white_10%)]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/catalogo" className="flex items-center gap-2 font-display text-xl font-semibold text-[var(--accent)]">
            <img src={logoGarfada} alt="" aria-hidden="true" className="size-9 object-contain" />
            <span>Garfada</span>
          </Link>

          <div className="flex items-center gap-2 lg:hidden">
            {me && <Avatar src={me.avatarUrl} name={me.name} size="sm" />}
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {me && (
            <Link to="/meu-perfil" className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-[var(--surface)]">
              <Avatar src={me.avatarUrl} name={me.name} size="sm" />
              <span className="text-sm font-medium text-[var(--text-primary)]">{me.username}</span>
            </Link>
          )}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
