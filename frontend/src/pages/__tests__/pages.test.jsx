import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authState: { current: null },
  restaurantService: {
    list: vi.fn(),
    getById: vi.fn(),
    getWishlist: vi.fn(),
    toggleWishlist: vi.fn(),
    getVisited: vi.fn(),
    toggleVisited: vi.fn(),
  },
  reviewService: {
    listByRestaurant: vi.fn(),
    create: vi.fn(),
  },
  socialService: {
    getFeed: vi.fn(),
    followUser: vi.fn(),
    searchUsers: vi.fn(),
  },
  userService: {
    getMe: vi.fn(),
    updateProfile: vi.fn(),
    getProfile: vi.fn(),
    getMyCollections: vi.fn(),
    getCollectionsByUser: vi.fn(),
  },
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mocks.authState.current,
}))

vi.mock('../../services/restaurantService', () => ({ restaurantService: mocks.restaurantService }))
vi.mock('../../services/reviewService', () => ({ reviewService: mocks.reviewService }))
vi.mock('../../services/socialService', () => ({ socialService: mocks.socialService }))
vi.mock('../../services/userService', () => ({ userService: mocks.userService }))

import { CatalogPage } from '../CatalogPage'
import { EditProfilePage } from '../EditProfilePage'
import { FeedPage } from '../FeedPage'
import { LandingPage } from '../LandingPage'
import { LoginPage } from '../LoginPage'
import { MyProfilePage } from '../MyProfilePage'
import { NotFoundPage } from '../NotFoundPage'
import { RegisterPage } from '../RegisterPage'
import { RestaurantDetailPage } from '../RestaurantDetailPage'
import { UserProfilePage } from '../UserProfilePage'
import { VisitedPage } from '../VisitedPage'
import { WishlistPage } from '../WishlistPage'

const restaurant = {
  id: 'r_1',
  name: 'Cantina da Ana',
  cuisine: 'Italiana',
  priceRange: '$$',
  description: 'Massas artesanais',
  address: 'Rua das Flores',
  photos: [
    'https://images.pexels.com/photos/1/food.jpeg',
    'https://images.pexels.com/photos/2/food.jpeg',
  ],
  menuPreview: [{ item: 'Ravioli', price: 'R$ 42' }],
  stats: {
    averageRating: 4.5,
    reviewsCount: 12,
    commentsCount: 8,
    visitsCount: 30,
  },
}

const me = {
  id: 'u_1',
  name: 'Ana Maria',
  email: 'ana@garfada.test',
  username: 'ana',
  avatarUrl: '',
  bio: 'Exploradora de massas',
  favoriteCuisines: ['Italiana'],
  reviewsCount: 1,
  visitedCount: 1,
  wishlistCount: 1,
  followersCount: 2,
  followingCount: 3,
}

const otherProfile = {
  ...me,
  id: 'u_2',
  name: 'Bia Costa',
  username: 'bia',
  isFollowing: false,
  followersCount: 5,
}

const review = {
  id: 'rev_1',
  restaurantId: 'r_1',
  userId: 'u_1',
  rating: 4.5,
  comment: 'Excelente massa',
  createdAt: '2026-06-14T12:00:00Z',
  user: me,
  restaurant,
}

const wishlistItem = {
  userId: 'u_1',
  restaurantId: 'r_1',
  addedAt: '2026-06-14T12:00:00Z',
  restaurant,
}

const visitedItem = {
  userId: 'u_1',
  restaurantId: 'r_1',
  visitedAt: '2026-06-14T12:00:00Z',
  userRating: 5,
  restaurant,
}

const { authState, restaurantService, reviewService, socialService, userService } = mocks

function renderRoute(path, element, initialEntry = path) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={path} element={element} />
        <Route path="/catalogo" element={<p>Catálogo destino</p>} />
        <Route path="/meu-perfil" element={<p>Meu perfil destino</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function defaultCollections() {
  return {
    reviews: [review],
    wishlist: [wishlistItem],
    visited: [visitedItem],
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.current = {
    me,
    session: { token: 'token-123', userId: 'u_1' },
    isAuthenticated: true,
    isBootstrapping: false,
    login: vi.fn().mockResolvedValue({ session: { token: 'token-123' }, profile: me }),
    register: vi.fn().mockResolvedValue({ session: { token: 'token-456' }, profile: me }),
    logout: vi.fn().mockResolvedValue(null),
    refreshMe: vi.fn().mockResolvedValue(me),
    setMe: vi.fn(),
  }

  restaurantService.list.mockResolvedValue([restaurant])
  restaurantService.getById.mockResolvedValue(restaurant)
  restaurantService.getWishlist.mockResolvedValue([])
  restaurantService.getVisited.mockResolvedValue([])
  restaurantService.toggleWishlist.mockResolvedValue({ active: true })
  restaurantService.toggleVisited.mockResolvedValue({ active: true })

  reviewService.listByRestaurant.mockResolvedValue([review])
  reviewService.create.mockResolvedValue({ id: 'rev_new' })

  socialService.getFeed.mockResolvedValue([{
    id: 'feed_1',
    type: 'review',
    createdAt: '2026-06-14T12:00:00Z',
    user: me,
    restaurant,
    review: { comment: 'Voltaria sempre' },
  }])
  socialService.searchUsers.mockResolvedValue([otherProfile])
  socialService.followUser.mockResolvedValue({ isFollowing: true, followersCount: 6 })

  userService.getMe.mockResolvedValue(me)
  userService.updateProfile.mockResolvedValue({ ...me, name: 'Ana Atualizada' })
  userService.getProfile.mockResolvedValue(otherProfile)
  userService.getMyCollections.mockResolvedValue(defaultCollections())
  userService.getCollectionsByUser.mockResolvedValue(defaultCollections())
})

describe('páginas públicas', () => {
  test('LandingPage renderiza navegação principal e CTAs', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Seu próximo restaurante começa na Garfada' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /criar conta/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /entrar/i }).length).toBeGreaterThan(0)
  })

  test('LoginPage valida campos obrigatórios e navega após login', async () => {
    renderRoute('/login', <LoginPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByText('Informe e-mail ou username.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('E-mail ou username'), 'ana')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await screen.findByText('Catálogo destino')
    expect(authState.current.login).toHaveBeenCalledWith({ identifier: 'ana', password: 'senha123' })
  })

  test('RegisterPage valida campos e envia cadastro aceito', async () => {
    renderRoute('/cadastro', <RegisterPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Maria')
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@garfada.test')
    await userEvent.type(screen.getByLabelText('Username'), 'ana')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'senha123')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    await screen.findByText('Catálogo destino')
    expect(authState.current.register).toHaveBeenCalledWith({
      name: 'Ana Maria',
      email: 'ana@garfada.test',
      username: 'ana',
      password: 'senha123',
    })
  })

  test('NotFoundPage renderiza uma rota de volta ao início', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para início' })).toHaveAttribute('href', '/')
  })
})

describe('páginas de catálogo e coleções', () => {
  test('CatalogPage carrega restaurantes e alterna wishlist', async () => {
    render(<MemoryRouter><CatalogPage /></MemoryRouter>)

    expect(await screen.findByText('Cantina da Ana')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(restaurantService.toggleWishlist).toHaveBeenCalledWith('r_1'))
    expect(authState.current.refreshMe).toHaveBeenCalled()
    expect(screen.getByText('Restaurante salvo na sua lista.')).toBeInTheDocument()
  })

  test('WishlistPage renderiza restaurantes salvos e remove um item', async () => {
    restaurantService.getWishlist.mockResolvedValueOnce([wishlistItem])
    restaurantService.getVisited.mockResolvedValueOnce([])

    render(<MemoryRouter><WishlistPage /></MemoryRouter>)

    expect(await screen.findByText('Lista de Desejos')).toBeInTheDocument()
    expect(screen.getByText('Cantina da Ana')).toBeInTheDocument()

    restaurantService.toggleWishlist.mockResolvedValueOnce({ active: false })
    await userEvent.click(screen.getByRole('button', { name: 'Na Lista' }))

    await waitFor(() => expect(restaurantService.toggleWishlist).toHaveBeenCalledWith('r_1'))
  })

  test('VisitedPage renderiza restaurantes visitados e alterna status de visita', async () => {
    restaurantService.getVisited.mockResolvedValueOnce([visitedItem])
    restaurantService.getWishlist.mockResolvedValueOnce([])

    render(<MemoryRouter><VisitedPage /></MemoryRouter>)

    expect(await screen.findByText('Visitados')).toBeInTheDocument()
    expect(screen.getByText('Sua nota: 5.0')).toBeInTheDocument()

    restaurantService.toggleVisited.mockResolvedValueOnce({ active: false })
    await userEvent.click(screen.getByRole('button', { name: 'Visitado' }))

    await waitFor(() => expect(restaurantService.toggleVisited).toHaveBeenCalledWith('r_1'))
  })
})

describe('páginas sociais e de perfil', () => {
  test('FeedPage renderiza atividades e segue usuários sugeridos', async () => {
    render(<MemoryRouter><FeedPage /></MemoryRouter>)

    expect(await screen.findByText('Atividades recentes')).toBeInTheDocument()
    expect(screen.getByText('Voltaria sempre', { exact: false })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Seguir' }))

    await waitFor(() => expect(socialService.followUser).toHaveBeenCalledWith('u_2'))
    expect(authState.current.refreshMe).toHaveBeenCalled()
  })

  test('MyProfilePage renderiza estatísticas e troca abas de coleção', async () => {
    render(<MemoryRouter><MyProfilePage /></MemoryRouter>)

    expect((await screen.findAllByText('Ana Maria')).length).toBeGreaterThan(0)
    expect(screen.getByText('Reviews publicadas')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Lista de desejos' }))
    expect(screen.getByText('Salvo em', { exact: false })).toBeInTheDocument()
  })

  test('UserProfilePage segue outro usuário e atualiza o botão visível', async () => {
    renderRoute('/usuarios/:id', <UserProfilePage />, '/usuarios/u_2')

    expect(await screen.findByText('Bia Costa')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Seguir' }))

    await waitFor(() => expect(socialService.followUser).toHaveBeenCalledWith('u_2'))
    expect(screen.getByRole('button', { name: 'Seguindo' })).toBeInTheDocument()
  })

  test('EditProfilePage salva campos de perfil normalizados e navega de volta', async () => {
    renderRoute('/perfil/editar', <EditProfilePage />)

    expect(await screen.findByDisplayValue('Ana Maria')).toBeInTheDocument()

    await userEvent.clear(screen.getByLabelText('Nome'))
    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Atualizada')
    await userEvent.clear(screen.getByLabelText('Culinárias favoritas'))
    await userEvent.type(screen.getByLabelText('Culinárias favoritas'), 'Italiana, Japonesa')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }))

    await screen.findByText('Meu perfil destino')
    expect(userService.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Ana Atualizada',
      favoriteCuisines: ['Italiana', 'Japonesa'],
    }))
    expect(authState.current.setMe).toHaveBeenCalledWith({ ...me, name: 'Ana Atualizada' })
  })
})

describe('página de detalhe do restaurante', () => {
  test('RestaurantDetailPage carrega detalhes, alterna status e envia nota rápida', async () => {
    renderRoute('/restaurantes/:id', <RestaurantDetailPage />, '/restaurantes/r_1')

    expect(await screen.findByRole('heading', { name: 'Cantina da Ana' })).toBeInTheDocument()
    expect(screen.getByText('Ravioli')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Adicionar à lista de desejos' }))
    await waitFor(() => expect(restaurantService.toggleWishlist).toHaveBeenCalledWith('r_1'))

    await userEvent.click(screen.getByRole('radio', { name: '4 estrelas' }))
    await userEvent.click(screen.getByRole('button', { name: 'Avaliar' }))

    await waitFor(() => expect(reviewService.create).toHaveBeenCalledWith('r_1', {
      rating: 4,
      comment: 'Excelente massa',
    }))
    expect(screen.getByText('Nota 4/5 enviada com sucesso.')).toBeInTheDocument()
  })
})
