import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeading } from '../components/common/PageHeading'
import { ReviewCard } from '../components/common/ReviewCard'
import { ReviewForm } from '../components/common/ReviewForm'
import { StatsGrid } from '../components/common/StatsGrid'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { Tabs } from '../components/ui/Tabs'
import { useAuth } from '../hooks/useAuth'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatPriceRange } from '../utils/format'
import { restaurantService } from '../services/restaurantService'
import { reviewService } from '../services/reviewService'

const detailTabs = [
  { value: 'overview', label: 'Visão Geral' },
  { value: 'reviews', label: 'Reviews' },
]

export function RestaurantDetailPage() {
  const { id } = useParams()
  const { refreshMe } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const reviewsSectionRef = useRef(null)

  const loadDetails = useCallback(async () => {
    const [restaurant, reviews, wishlist, visited] = await Promise.all([
      restaurantService.getById(id),
      reviewService.listByRestaurant(id),
      restaurantService.getWishlist(),
      restaurantService.getVisited(),
    ])

    return {
      restaurant,
      reviews,
      wishlistIds: wishlist.map((item) => item.restaurantId),
      visitedIds: visited.map((item) => item.restaurantId),
    }
  }, [id])

  const { data, setData, loading, error, reload } = useAsyncData(loadDetails)

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setFeedbackMessage('')
    }, 2200)

    return () => window.clearTimeout(timeout)
  }, [feedbackMessage])

  async function handleToggleWishlist() {
    const result = await restaurantService.toggleWishlist(id)

    setData((current) => {
      if (!current) {
        return current
      }

      const wishlistIds = result.active
        ? [...current.wishlistIds, id]
        : current.wishlistIds.filter((restaurantId) => restaurantId !== id)

      return {
        ...current,
        wishlistIds,
      }
    })

    await refreshMe()
    setFeedbackMessage(result.active ? 'Adicionado à lista de desejos.' : 'Removido da lista de desejos.')
  }

  async function handleToggleVisited() {
    const result = await restaurantService.toggleVisited(id)

    setData((current) => {
      if (!current) {
        return current
      }

      const visitedIds = result.active
        ? [...current.visitedIds, id]
        : current.visitedIds.filter((restaurantId) => restaurantId !== id)

      return {
        ...current,
        visitedIds,
      }
    })

    await refreshMe()
    setFeedbackMessage(result.active ? 'Restaurante marcado como visitado.' : 'Restaurante removido de visitados.')
  }

  async function handleCreateReview(payload) {
    await reviewService.create(id, payload)
    setShowReviewForm(false)
    await reload()
    await refreshMe()
    setFeedbackMessage('Avaliação publicada com sucesso.')
  }

  function openReviewsSection({ openForm = false } = {}) {
    setActiveTab('reviews')
    if (openForm) {
      setShowReviewForm(true)
    }

    window.requestAnimationFrame(() => {
      reviewsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  if (loading) {
    return <LoadingState title="Carregando restaurante" description="Buscando detalhes e avaliações." />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={reload} />
  }

  if (!data) {
    return null
  }

  const { restaurant, reviews, wishlistIds, visitedIds } = data
  const isWishlisted = wishlistIds.includes(restaurant.id)
  const isVisited = visitedIds.includes(restaurant.id)

  return (
    <div className="space-y-6">
      <PageHeading
        title={restaurant.name}
        description={restaurant.description}
        action={
          <Link to="/catalogo" className="text-sm font-medium text-[var(--accent)] hover:underline">
            Voltar ao catálogo
          </Link>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <img
            src={restaurant.photos[0]}
            alt={`Foto principal de ${restaurant.name}`}
            className="h-72 w-full rounded-xl object-cover"
          />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {restaurant.photos.slice(1).map((photo) => (
              <img key={photo} src={photo} alt={`Galeria de ${restaurant.name}`} className="h-24 w-full rounded-xl object-cover" />
            ))}
          </div>
        </article>

        <aside className="space-y-3">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="font-display text-xl text-[var(--text-primary)]">Informações</h2>
            <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <p>
                <span className="font-semibold text-[var(--text-primary)]">Cozinha:</span> {restaurant.cuisine}
              </p>
              <p>
                <span className="font-semibold text-[var(--text-primary)]">Preço:</span>{' '}
                {formatPriceRange(restaurant.priceRange)}
              </p>
              <p>
                <span className="font-semibold text-[var(--text-primary)]">Endereço:</span> {restaurant.address}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant={isWishlisted ? 'highlight' : 'secondary'} onClick={handleToggleWishlist}>
                {isWishlisted ? 'Remover da Lista de Desejos' : 'Adicionar à Lista de Desejos'}
              </Button>
              <Button variant={isVisited ? 'primary' : 'secondary'} onClick={handleToggleVisited}>
                {isVisited ? 'Visitado' : 'Marcar Visitado'}
              </Button>
              <Button variant="secondary" onClick={() => openReviewsSection({ openForm: true })}>
                Avaliar
              </Button>
            </div>
          </article>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="font-display text-xl text-[var(--text-primary)]">Prévia do cardápio</h2>
            <ul className="mt-3 space-y-2">
              {restaurant.menuPreview.map((menuItem) => (
                <li key={menuItem.item} className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                  <span>{menuItem.item}</span>
                  <Badge variant="neutral">{menuItem.price}</Badge>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </section>

      {feedbackMessage && (
        <p className="rounded-xl bg-[color-mix(in_srgb,var(--highlight)_20%,var(--surface))] px-3 py-2 text-sm text-[var(--deep-accent)]">
          {feedbackMessage}
        </p>
      )}

      <StatsGrid
        stats={[
          { label: 'Média Geral', value: restaurant.stats.averageRating.toFixed(1) },
          { label: 'Avaliações', value: restaurant.stats.reviewsCount },
          { label: 'Comentários', value: restaurant.stats.commentsCount },
          { label: 'Visitas', value: restaurant.stats.visitsCount },
        ]}
      />

      <section
        ref={reviewsSectionRef}
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
      >
        <Tabs tabs={detailTabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'overview' && (
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>{restaurant.description}</p>
            <p>Explore as avaliações para entender o que a comunidade mais valoriza na experiência.</p>
            <Button variant="secondary" onClick={() => openReviewsSection()}>
              Ver reviews
            </Button>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {showReviewForm && (
              <ReviewForm
                onSubmit={handleCreateReview}
                onCancel={() => setShowReviewForm(false)}
                initialRating={4}
              />
            )}

            {!showReviewForm && (
              <Button variant="secondary" onClick={() => setShowReviewForm(true)}>
                Escrever avaliação
              </Button>
            )}

            {reviews.length === 0 && (
              <EmptyState
                title="Sem reviews ainda"
                description="Seja o primeiro a compartilhar sua experiência neste restaurante."
              />
            )}

            {reviews.length > 0 && (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
