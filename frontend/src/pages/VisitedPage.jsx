import { useCallback } from 'react'
import { RestaurantCard } from '../components/common/RestaurantCard'
import { PageHeading } from '../components/common/PageHeading'
import { RestaurantCardSkeleton } from '../components/common/RestaurantCardSkeleton'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { useAuth } from '../hooks/useAuth'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatDate } from '../utils/format'
import { restaurantService } from '../services/restaurantService'

export function VisitedPage() {
  const { refreshMe } = useAuth()

  const loadVisited = useCallback(async () => {
    const [visited, wishlist] = await Promise.all([
      restaurantService.getVisited(),
      restaurantService.getWishlist(),
    ])

    return {
      visited,
      wishlistIds: wishlist.map((item) => item.restaurantId),
    }
  }, [])

  const { data, setData, loading, error, reload } = useAsyncData(loadVisited)

  async function handleToggleVisited(restaurantId) {
    const result = await restaurantService.toggleVisited(restaurantId)

    setData((current) => {
      if (!current) {
        return current
      }

      const nextVisited = result.active
        ? current.visited
        : current.visited.filter((item) => item.restaurantId !== restaurantId)

      return {
        ...current,
        visited: nextVisited,
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

      const wishlistIds = result.active
        ? [...current.wishlistIds, restaurantId]
        : current.wishlistIds.filter((id) => id !== restaurantId)

      return {
        ...current,
        wishlistIds,
      }
    })

    await refreshMe()
  }

  return (
    <div>
      <PageHeading
        title="Visitados"
        description="Seu histórico de restaurantes já explorados, com notas e datas registradas."
      />

      {error && <ErrorState message={error.message} onRetry={reload} />}

      {!error && loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <RestaurantCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!error && !loading && data && data.visited.length === 0 && (
        <EmptyState
          title="Nenhuma visita registrada"
          description="Marque restaurantes como visitados no catálogo para acompanhar seu histórico."
        />
      )}

      {!error && !loading && data && data.visited.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.visited.map((item) => (
            <RestaurantCard
              key={item.restaurantId}
              restaurant={item.restaurant}
              isWishlisted={data.wishlistIds.includes(item.restaurantId)}
              isVisited
              onToggleWishlist={handleToggleWishlist}
              onToggleVisited={handleToggleVisited}
              footer={
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">Visitado em {formatDate(item.visitedAt)}</Badge>
                  {item.userRating && <Badge variant="warm">Sua nota: {item.userRating.toFixed(1)}</Badge>}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
