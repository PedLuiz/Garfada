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

export function WishlistPage() {
  const { refreshMe } = useAuth()

  const loadWishlist = useCallback(async () => {
    const [wishlist, visited] = await Promise.all([
      restaurantService.getWishlist(),
      restaurantService.getVisited(),
    ])

    return {
      wishlist,
      visitedIds: visited.map((item) => item.restaurantId),
    }
  }, [])

  const { data, setData, loading, error, reload } = useAsyncData(loadWishlist)

  async function handleToggleWishlist(restaurantId) {
    const result = await restaurantService.toggleWishlist(restaurantId)

    setData((current) => {
      if (!current) {
        return current
      }

      const nextWishlist = result.active
        ? current.wishlist
        : current.wishlist.filter((item) => item.restaurantId !== restaurantId)

      return {
        ...current,
        wishlist: nextWishlist,
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

      const visitedIds = result.active
        ? [...current.visitedIds, restaurantId]
        : current.visitedIds.filter((id) => id !== restaurantId)

      return {
        ...current,
        visitedIds,
      }
    })

    await refreshMe()
  }

  return (
    <div>
      <PageHeading
        title="Lista de Desejos"
        description="Restaurantes que você salvou para visitar em breve."
      />

      {error && <ErrorState message={error.message} onRetry={reload} />}

      {!error && loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <RestaurantCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!error && !loading && data && data.wishlist.length === 0 && (
        <EmptyState
          title="Sua lista está vazia"
          description="Salve restaurantes no catálogo para montar seus próximos roteiros gastronômicos."
        />
      )}

      {!error && !loading && data && data.wishlist.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.wishlist.map((item) => (
            <RestaurantCard
              key={item.restaurantId}
              restaurant={item.restaurant}
              isWishlisted
              isVisited={data.visitedIds.includes(item.restaurantId)}
              onToggleWishlist={handleToggleWishlist}
              onToggleVisited={handleToggleVisited}
              footer={<Badge variant="neutral">Salvo em {formatDate(item.addedAt)}</Badge>}
            />
          ))}
        </div>
      )}
    </div>
  )
}
