import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const auth = vi.hoisted(() => ({
  state: {
    isAuthenticated: false,
    isBootstrapping: false,
  },
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => auth.state,
}))

vi.mock('../../layouts/AppLayout', async () => {
  const { Outlet } = await vi.importActual('react-router-dom')

  return {
    AppLayout: () => (
      <div>
        <p>App layout</p>
        <Outlet />
      </div>
    ),
  }
})

vi.mock('../../layouts/PublicLayout', async () => {
  const { Outlet } = await vi.importActual('react-router-dom')

  return {
    PublicLayout: () => (
      <div>
        <p>Public layout</p>
        <Outlet />
      </div>
    ),
  }
})

vi.mock('../../pages/CatalogPage', () => ({ CatalogPage: () => <p>Catalog page</p> }))
vi.mock('../../pages/EditProfilePage', () => ({ EditProfilePage: () => <p>Edit profile page</p> }))
vi.mock('../../pages/FeedPage', () => ({ FeedPage: () => <p>Feed page</p> }))
vi.mock('../../pages/LandingPage', () => ({ LandingPage: () => <p>Landing page</p> }))
vi.mock('../../pages/LoginPage', () => ({ LoginPage: () => <p>Login page</p> }))
vi.mock('../../pages/MyProfilePage', () => ({ MyProfilePage: () => <p>My profile page</p> }))
vi.mock('../../pages/NotFoundPage', () => ({ NotFoundPage: () => <p>Not found page</p> }))
vi.mock('../../pages/RegisterPage', () => ({ RegisterPage: () => <p>Register page</p> }))
vi.mock('../../pages/RestaurantDetailPage', () => ({ RestaurantDetailPage: () => <p>Restaurant detail page</p> }))
vi.mock('../../pages/UserProfilePage', () => ({ UserProfilePage: () => <p>User profile page</p> }))
vi.mock('../../pages/VisitedPage', () => ({ VisitedPage: () => <p>Visited page</p> }))
vi.mock('../../pages/WishlistPage', () => ({ WishlistPage: () => <p>Wishlist page</p> }))

const { AppRouter } = await import('../AppRouter')

function renderAt(path, state = {}) {
  auth.state = {
    isAuthenticated: false,
    isBootstrapping: false,
    ...state,
  }
  window.history.pushState({}, '', path)

  return render(<AppRouter />)
}

describe('AppRouter', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  test('mostra estado de inicialização antes de resolver rotas protegidas', () => {
    renderAt('/catalogo', { isBootstrapping: true })

    expect(screen.getByText('Preparando sessão')).toBeInTheDocument()
  })

  test('redireciona usuários não autenticados de rotas privadas para login', async () => {
    renderAt('/catalogo')

    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(screen.getByText('Public layout')).toBeInTheDocument()
  })

  test('redireciona usuários autenticados para fora de rotas apenas públicas', async () => {
    renderAt('/login', { isAuthenticated: true })

    expect(await screen.findByText('Catalog page')).toBeInTheDocument()
    expect(screen.getByText('App layout')).toBeInTheDocument()
  })

  test('renderiza a página inicial pública e rotas alternativas', async () => {
    const { unmount } = renderAt('/')

    expect(await screen.findByText('Landing page')).toBeInTheDocument()
    unmount()

    renderAt('/sem-rota')
    expect(await screen.findByText('Not found page')).toBeInTheDocument()
  })
})
