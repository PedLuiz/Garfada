import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeading } from '../components/common/PageHeading'
import { RestaurantCard } from '../components/common/RestaurantCard'
import { ReviewCard } from '../components/common/ReviewCard'
import { StatsGrid } from '../components/common/StatsGrid'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { Tabs } from '../components/ui/Tabs'
import { useAuth } from '../hooks/useAuth'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatDate } from '../utils/format'
import { restaurantService } from '../services/restaurantService'
import { userService } from '../services/userService'

const profileTabs = [
  { value: 'reviews', label: 'Avaliações' },
  { value: 'wishlist', label: 'Lista de desejos' },
  { value: 'visited', label: 'Visitados' },
]

export function MyProfilePage() {
  const { setMe, refreshMe } = useAuth()
  const [activeTab, setActiveTab] = useState('reviews')

  const loadProfileData = useCallback(async () => {
    const [me, collections] = await Promise.all([userService.getMe(), userService.getMyCollections()])

    return {
      me,
      ...collections,
    }
  }, [])

  const { data, loading, error, reload } = useAsyncData(loadProfileData)

  async function handleToggleWishlist(restaurantId) {
    await restaurantService.toggleWishlist(restaurantId)
    const updatedMe = await refreshMe()

    if (updatedMe) {
      setMe(updatedMe)
    }

    await reload()
  }

  async function handleToggleVisited(restaurantId) {
    await restaurantService.toggleVisited(restaurantId)
    const updatedMe = await refreshMe()

    if (updatedMe) {
      setMe(updatedMe)
    }

    await reload()
  }

  if (loading) {
    return <LoadingState title="Carregando perfil" description="Buscando suas informações." />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={reload} />
  }

  if (!data) {
    return null
  }

  const { me, reviews, wishlist, visited } = data

  return (
    <div className="space-y-6">
      <PageHeading
        title="Meu Perfil"
        description="Sua vitrine social no Garfada."
        action={
          <Link to="/perfil/editar">
            <Button variant="secondary">Editar perfil</Button>
          </Link>
        }
      />

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar src={me.avatarUrl} name={me.name} size="xl" />
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-[var(--text-primary)]">{me.name}</h2>
            <p className="text-sm text-[var(--text-secondary)]">@{me.username}</p>
            <p className="text-sm text-[var(--text-secondary)]">{me.bio}</p>
            <div className="flex flex-wrap gap-2">
              {me.favoriteCuisines.map((cuisine) => (
                <Badge key={cuisine} variant="warm">
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StatsGrid
        stats={[
          { label: 'Reviews publicadas', value: me.reviewsCount },
          { label: 'Visitados', value: me.visitedCount },
          { label: 'Lista de desejos', value: me.wishlistCount },
          { label: 'Seguidores', value: me.followersCount },
          { label: 'Seguindo', value: me.followingCount },
        ]}
      />

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <Tabs tabs={profileTabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {reviews.length === 0 && (
              <EmptyState
                title="Nenhuma avaliação ainda"
                description="Avalie restaurantes para construir seu histórico gastronômico."
              />
            )}

            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {wishlist.length === 0 && (
              <div className="sm:col-span-2 xl:col-span-3">
                <EmptyState
                  title="Lista de desejos vazia"
                  description="Salve restaurantes do catálogo para vê-los aqui."
                />
              </div>
            )}

            {wishlist.map((item) => (
              <RestaurantCard
                key={item.restaurantId}
                restaurant={item.restaurant}
                isWishlisted
                isVisited={visited.some((visit) => visit.restaurantId === item.restaurantId)}
                onToggleWishlist={handleToggleWishlist}
                onToggleVisited={handleToggleVisited}
                footer={<Badge variant="neutral">Salvo em {formatDate(item.addedAt)}</Badge>}
              />
            ))}
          </div>
        )}

        {activeTab === 'visited' && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visited.length === 0 && (
              <div className="sm:col-span-2 xl:col-span-3">
                <EmptyState
                  title="Sem restaurantes visitados"
                  description="Marque restaurantes como visitados para construir seu diário gastronômico."
                />
              </div>
            )}

            {visited.map((item) => (
              <RestaurantCard
                key={item.restaurantId}
                restaurant={item.restaurant}
                isWishlisted={wishlist.some((wishlistItem) => wishlistItem.restaurantId === item.restaurantId)}
                isVisited
                onToggleWishlist={handleToggleWishlist}
                onToggleVisited={handleToggleVisited}
                footer={
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">Visitado em {formatDate(item.visitedAt)}</Badge>
                    {item.userRating && <Badge variant="warm">Nota: {item.userRating.toFixed(1)}</Badge>}
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
