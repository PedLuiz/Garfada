import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
import { socialService } from '../services/socialService'
import { userService } from '../services/userService'

const tabs = [
  { value: 'reviews', label: 'Avaliações' },
  { value: 'visited', label: 'Visitados' },
  { value: 'wishlist', label: 'Lista pública' },
]

export function UserProfilePage() {
  const { id } = useParams()
  const { me, refreshMe } = useAuth()
  const [activeTab, setActiveTab] = useState('reviews')

  const loadUserData = useCallback(async () => {
    const [profile, collections, wishlist, visited] = await Promise.all([
      userService.getProfile(id),
      userService.getCollectionsByUser(id),
      restaurantService.getWishlist(),
      restaurantService.getVisited(),
    ])

    return {
      profile,
      ...collections,
      myWishlistIds: wishlist.map((item) => item.restaurantId),
      myVisitedIds: visited.map((item) => item.restaurantId),
    }
  }, [id])

  const { data, setData, loading, error, reload } = useAsyncData(loadUserData)

  async function handleFollowToggle() {
    const result = await socialService.followUser(id)

    setData((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        profile: {
          ...current.profile,
          isFollowing: result.isFollowing,
          followersCount: result.followersCount,
        },
      }
    })

    await refreshMe()
  }

  async function handleToggleWishlist(restaurantId) {
    const result = await restaurantService.toggleWishlist(restaurantId)

    setData((current) => {
      if (!current) {
        return current
      }

      const myWishlistIds = result.active
        ? [...current.myWishlistIds, restaurantId]
        : current.myWishlistIds.filter((itemId) => itemId !== restaurantId)

      return {
        ...current,
        myWishlistIds,
      }
    })

    await refreshMe()
  }

  async function handleToggleVisited(restaurantId) {
    const result = await restaurantService.toggleVisited(restaurantId)

    setData((current) => {
      if (!current) {
        return current
      }

      const myVisitedIds = result.active
        ? [...current.myVisitedIds, restaurantId]
        : current.myVisitedIds.filter((itemId) => itemId !== restaurantId)

      return {
        ...current,
        myVisitedIds,
      }
    })

    await refreshMe()
  }

  if (loading) {
    return <LoadingState title="Carregando perfil" description="Buscando informações da pessoa usuária." />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={reload} />
  }

  if (!data) {
    return null
  }

  const { profile, reviews, wishlist, visited, myWishlistIds, myVisitedIds } = data
  const isMyOwnProfile = me?.id === profile.id

  return (
    <div className="space-y-6">
      <PageHeading
        title="Perfil"
        description="Conheça avaliações e histórico gastronômico deste usuário."
        action={
          isMyOwnProfile ? (
            <Link to="/meu-perfil">
              <Button variant="secondary">Ir para meu perfil</Button>
            </Link>
          ) : (
            <Button variant={profile.isFollowing ? 'secondary' : 'primary'} onClick={handleFollowToggle}>
              {profile.isFollowing ? 'Seguindo' : 'Seguir'}
            </Button>
          )
        }
      />

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar src={profile.avatarUrl} name={profile.name} size="xl" />
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-[var(--text-primary)]">{profile.name}</h2>
            <p className="text-sm text-[var(--text-secondary)]">@{profile.username}</p>
            <p className="text-sm text-[var(--text-secondary)]">{profile.bio}</p>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteCuisines.map((cuisine) => (
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
          { label: 'Reviews', value: profile.reviewsCount },
          { label: 'Visitados', value: profile.visitedCount },
          { label: 'Lista pública', value: profile.wishlistCount },
          { label: 'Seguidores', value: profile.followersCount },
          { label: 'Seguindo', value: profile.followingCount },
        ]}
      />

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {reviews.length === 0 && (
              <EmptyState title="Sem avaliações públicas" description="Este usuário ainda não publicou reviews." />
            )}

            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {activeTab === 'visited' && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visited.length === 0 && (
              <div className="sm:col-span-2 xl:col-span-3">
                <EmptyState title="Sem visitas públicas" description="Ainda não há restaurantes visitados para mostrar." />
              </div>
            )}

            {visited.map((item) => (
              <RestaurantCard
                key={item.restaurantId}
                restaurant={item.restaurant}
                isWishlisted={myWishlistIds.includes(item.restaurantId)}
                isVisited={myVisitedIds.includes(item.restaurantId)}
                onToggleWishlist={handleToggleWishlist}
                onToggleVisited={handleToggleVisited}
                footer={<Badge variant="neutral">Visitado em {formatDate(item.visitedAt)}</Badge>}
              />
            ))}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {wishlist.length === 0 && (
              <div className="sm:col-span-2 xl:col-span-3">
                <EmptyState
                  title="Sem lista pública"
                  description="Este usuário ainda não publicou restaurantes na lista de desejos."
                />
              </div>
            )}

            {wishlist.map((item) => (
              <RestaurantCard
                key={item.restaurantId}
                restaurant={item.restaurant}
                isWishlisted={myWishlistIds.includes(item.restaurantId)}
                isVisited={myVisitedIds.includes(item.restaurantId)}
                onToggleWishlist={handleToggleWishlist}
                onToggleVisited={handleToggleVisited}
                footer={<Badge variant="neutral">Salvo em {formatDate(item.addedAt)}</Badge>}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
