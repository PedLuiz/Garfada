import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'
import { FeedActivityCard } from '../FeedActivityCard'
import { AuthShowcaseLayout } from '../AuthShowcaseLayout'
import { PageHeading } from '../PageHeading'
import { RestaurantCard } from '../RestaurantCard'
import { RestaurantCardSkeleton } from '../RestaurantCardSkeleton'
import { RestaurantFilters } from '../RestaurantFilters'
import { ReviewCard } from '../ReviewCard'
import { ReviewForm } from '../ReviewForm'
import { StatsGrid } from '../StatsGrid'
import { UserPreviewCard } from '../UserPreviewCard'

const restaurant = {
  id: 'r_1',
  name: 'Cantina da Ana',
  cuisine: 'Italiana',
  priceRange: '$$',
  description: 'Massas artesanais',
  address: 'Rua das Flores',
  photos: ['https://images.pexels.com/photos/1/food.jpeg'],
  stats: {
    averageRating: 4.5,
    reviewsCount: 12,
    visitsCount: 30,
  },
}

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('componentes comuns', () => {
  test('RestaurantCard renderiza detalhes do restaurante e alterna coleções', async () => {
    const onToggleWishlist = vi.fn()
    const onToggleVisited = vi.fn()

    renderWithRouter(
      <RestaurantCard
        restaurant={restaurant}
        isWishlisted
        onToggleWishlist={onToggleWishlist}
        onToggleVisited={onToggleVisited}
      />,
    )

    expect(screen.getByText('Cantina da Ana')).toBeInTheDocument()
    expect(screen.getByText('$$ · Moderado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /foto do restaurante/i })).toHaveAttribute('href', '/restaurantes/r_1')

    await userEvent.click(screen.getByRole('button', { name: 'Na Lista' }))
    await userEvent.click(screen.getByRole('button', { name: 'Marcar visita' }))

    expect(onToggleWishlist).toHaveBeenCalledWith('r_1')
    expect(onToggleVisited).toHaveBeenCalledWith('r_1')
  })

  test('RestaurantCard na variante catálogo renderiza rodapé e rótulos ativos', async () => {
    const onToggleWishlist = vi.fn()
    const onToggleVisited = vi.fn()

    renderWithRouter(
      <RestaurantCard
        restaurant={restaurant}
        variant="catalog"
        isVisited
        footer={<p>Aberto hoje</p>}
        onToggleWishlist={onToggleWishlist}
        onToggleVisited={onToggleVisited}
      />,
    )

    expect(screen.getByText('Aberto hoje')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Visitado' }))

    expect(onToggleWishlist).toHaveBeenCalledWith('r_1')
    expect(onToggleVisited).toHaveBeenCalledWith('r_1')
  })

  test('RestaurantFilters informa mudanças de campo, reset e filtros ativos', async () => {
    const onChange = vi.fn()
    const onReset = vi.fn()
    render(
      <RestaurantFilters
        filters={{
          search: 'pizza',
          location: 'Savassi',
          cuisine: 'Italiana',
          priceRange: '$$',
          minRating: '4',
        }}
        onChange={onChange}
        onReset={onReset}
        activeFiltersCount={5}
      />,
    )

    expect(screen.getByText('5 filtros ativos')).toBeInTheDocument()
    expect(screen.getByText('Busca:')).toBeInTheDocument()
    expect(screen.getAllByText('Italiana').length).toBeGreaterThan(0)

    fireEvent.change(screen.getByLabelText('Busca'), { target: { value: 'sushi' } })
    fireEvent.change(screen.getByLabelText('Preço'), { target: { value: '$$$' } })
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))

    expect(onChange).toHaveBeenCalledWith('search', 'sushi')
    expect(onChange).toHaveBeenCalledWith('priceRange', '$$$')
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  test('RestaurantFilters na variante compacta renderiza os mesmos controles', () => {
    render(<RestaurantFilters
      variant="compact"
      filters={{ search: '', location: '', cuisine: 'all', priceRange: 'all', minRating: '0' }}
      onChange={vi.fn()}
    />)

    expect(screen.getByLabelText('Busca')).toBeInTheDocument()
    expect(screen.getByLabelText('Avaliação mínima')).toBeInTheDocument()
  })

  test('ReviewForm valida nota, envia comentários e trata erros de envio', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onCancel = vi.fn()
    const { rerender } = render(<ReviewForm rating={0} onSubmit={onSubmit} onCancel={onCancel} />)

    await userEvent.click(screen.getByRole('button', { name: 'Publicar avaliação' }))
    expect(screen.getByText('Selecione uma nota nas estrelas ao lado do botão Avaliar.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    rerender(<ReviewForm key="rated" rating={4} initialComment="Bom" onSubmit={onSubmit} onCancel={onCancel} />)
    await userEvent.type(screen.getByPlaceholderText('Como foi sua experiência?'), ' demais')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar avaliação' }))

    expect(onSubmit).toHaveBeenCalledWith({ rating: 4, comment: 'Bom demais' })

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  test('ReviewForm exibe falhas de envio', async () => {
    render(<ReviewForm rating={5} onSubmit={vi.fn().mockRejectedValue(new Error('Falha ao salvar'))} />)

    await userEvent.click(screen.getByRole('button', { name: 'Publicar avaliação' }))

    expect(await screen.findByText('Falha ao salvar')).toBeInTheDocument()
  })

  test('ReviewCard, StatsGrid, FeedActivityCard e UserPreviewCard renderizam conteúdo do domínio', async () => {
    const onFollow = vi.fn()
    renderWithRouter(
      <>
        <ReviewCard review={{
          user: { id: 'u_1', name: 'Ana Maria', username: 'ana', avatarUrl: '' },
          rating: 4.5,
          createdAt: '2026-06-14T12:00:00Z',
          comment: 'Excelente massa',
        }} />
        <StatsGrid stats={[{ label: 'Reviews', value: '12' }]} />
        <FeedActivityCard item={{
          id: 'feed_1',
          type: 'review',
          createdAt: '2026-06-14T12:00:00Z',
          user: { id: 'u_1', name: 'Ana Maria', username: 'ana', avatarUrl: '' },
          restaurant: { id: 'r_1', name: 'Cantina da Ana' },
          review: { comment: 'Voltaria sempre' },
        }} />
        <FeedActivityCard item={{
          id: 'feed_2',
          type: 'follow',
          createdAt: '2026-06-14T12:00:00Z',
          user: { id: 'u_1', name: 'Ana Maria', username: 'ana', avatarUrl: '' },
          targetUser: { id: 'u_2', username: 'bia' },
        }} />
        <UserPreviewCard
          user={{ id: 'u_2', name: 'Bia Costa', username: 'bia', avatarUrl: '', isFollowing: false }}
          onFollow={onFollow}
        />
      </>,
    )

    expect(screen.getByText('Excelente massa')).toBeInTheDocument()
    expect(screen.getByText('Reviews')).toBeInTheDocument()
    expect(screen.getByText('Voltaria sempre', { exact: false })).toBeInTheDocument()
    expect(screen.getAllByText('@bia').length).toBeGreaterThan(0)

    await userEvent.click(screen.getByRole('button', { name: 'Seguir' }))
    expect(onFollow).toHaveBeenCalledWith('u_2')
  })

  test('PageHeading renderiza metadados de catálogo e layout alternativo de ação', () => {
    const { rerender } = render(
      <PageHeading
        title="Catálogo"
        description="Escolha um restaurante"
        eyebrow="Garfada"
        meta={[{ label: 'Restaurantes', value: '8' }]}
        action={<button type="button">Novo filtro</button>}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
    expect(screen.getByText('Garfada')).toBeInTheDocument()
    expect(screen.getByText('Restaurantes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo filtro' })).toBeInTheDocument()

    rerender(<PageHeading variant="simple" title="Perfil" action={<button type="button">Editar</button>} />)
    expect(screen.getByRole('heading', { name: 'Perfil' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  test('AuthShowcaseLayout renderiza conteúdo filho, painel de imagem e marcadores opcionais', () => {
    render(
      <AuthShowcaseLayout
        imageSrc="/dish.png"
        imageAlt="Prato"
        imageTitle="Descubra novos sabores"
        imageDescription="Avaliações da comunidade"
        panelBadge="Novo"
        panelPills={['Reviews', 'Listas']}
      >
        <h1>Entrar</h1>
      </AuthShowcaseLayout>,
    )

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Prato' })).toHaveAttribute('src', '/dish.png')
    expect(screen.getByText('Descubra novos sabores')).toBeInTheDocument()
    expect(screen.getByText('Reviews')).toBeInTheDocument()
  })

  test('RestaurantCardSkeleton renderiza blocos reservados', () => {
    const { container } = render(<RestaurantCardSkeleton />)

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
