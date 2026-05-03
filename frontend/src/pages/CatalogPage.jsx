import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHeading } from '../components/common/PageHeading'
import { RestaurantCard } from '../components/common/RestaurantCard'
import { RestaurantCardSkeleton } from '../components/common/RestaurantCardSkeleton'
import { RestaurantFilters } from '../components/common/RestaurantFilters'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { useAuth } from '../hooks/useAuth'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { restaurantService } from '../services/restaurantService'

const defaultFilters = {
  search: '',
  location: '',
  cuisine: 'all',
  priceRange: 'all',
  minRating: '0',
}

export function CatalogPage() {
  const { refreshMe } = useAuth()
  const [filters, setFilters] = useState(defaultFilters)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const debouncedSearch = useDebouncedValue(filters.search)
  const debouncedLocation = useDebouncedValue(filters.location)

  const requestFilters = useMemo(
    () => ({
      search: debouncedSearch,
      location: debouncedLocation,
      cuisine: filters.cuisine,
      priceRange: filters.priceRange,
      minRating: filters.minRating,
    }),
    [debouncedLocation, debouncedSearch, filters.cuisine, filters.priceRange, filters.minRating],
  )

  const loadCatalog = useCallback(async () => {
    const [restaurants, wishlist, visited] = await Promise.all([
      restaurantService.list(requestFilters),
      restaurantService.getWishlist(),
      restaurantService.getVisited(),
    ])

    return {
      restaurants,
      wishlistIds: wishlist.map((item) => item.restaurantId),
      visitedIds: visited.map((item) => item.restaurantId),
    }
  }, [requestFilters])

  const { data, setData, loading, error, reload } = useAsyncData(loadCatalog)

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setFeedbackMessage('')
    }, 2200)

    return () => window.clearTimeout(timeout)
  }, [feedbackMessage])

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function resetFilters() {
    setFilters(defaultFilters)
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
    setFeedbackMessage(result.active ? 'Restaurante salvo na sua lista.' : 'Restaurante removido da lista de desejos.')
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
    setFeedbackMessage(result.active ? 'Visita registrada com sucesso.' : 'Visita removida do seu histórico.')
  }

  return (
    <div>
      <PageHeading
        title="Catálogo"
        description="Descubra restaurantes por localização, cozinha, faixa de preço e avaliação média da comunidade."
      />

      <RestaurantFilters filters={filters} onChange={updateFilter} />

      {feedbackMessage && (
        <p className="mt-3 rounded-xl bg-[color-mix(in_srgb,var(--highlight)_20%,var(--surface))] px-3 py-2 text-sm text-[var(--deep-accent)]">
          {feedbackMessage}
        </p>
      )}

      <section className="mt-5">
        {error && <ErrorState message={error.message} onRetry={reload} />}

        {!error && loading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <RestaurantCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!error && !loading && data && data.restaurants.length === 0 && (
          <EmptyState
            title="Nenhum restaurante encontrado"
            description="Ajuste os filtros ou limpe a busca para descobrir novos lugares."
            actionLabel="Limpar filtros"
            onAction={resetFilters}
          />
        )}

        {!error && !loading && data && data.restaurants.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isWishlisted={data.wishlistIds.includes(restaurant.id)}
                isVisited={data.visitedIds.includes(restaurant.id)}
                onToggleWishlist={handleToggleWishlist}
                onToggleVisited={handleToggleVisited}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
