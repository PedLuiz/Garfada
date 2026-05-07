import { Link } from 'react-router-dom'
import { formatPriceRange } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { getOptimizedImageUrl } from '../../utils/imageUrl'

export function RestaurantCard({
  restaurant,
  isWishlisted = false,
  isVisited = false,
  onToggleWishlist,
  onToggleVisited,
  footer,
  variant = 'default',
}) {
  if (variant === 'catalog') {
    return (
      <article className="group relative overflow-hidden rounded-[1.25rem] border border-[color-mix(in_srgb,var(--accent)_16%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_88%,white_12%)] shadow-lg shadow-black/10 md:h-[26.5rem]">
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 bg-black/72 px-4 py-2.5 backdrop-blur-[1px]">
          <h3 className="font-display text-xl leading-tight !text-white">{restaurant.name}</h3>
        </div>

        <Link
          to={`/restaurantes/${restaurant.id}`}
          className="relative z-20 block h-[17.5rem] overflow-hidden md:absolute md:inset-0 md:h-full md:transition-transform md:duration-300 md:ease-out md:group-hover:-translate-y-[10.25rem] md:group-focus-within:-translate-y-[10.25rem]"
        >
          <img
            src={getOptimizedImageUrl(restaurant.photos[0], { width: 900, height: 1200 })}
            alt={`Foto do restaurante ${restaurant.name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/68 via-black/24 to-black/10" />

          <div className="absolute bottom-4 left-4 right-4">
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/85">{restaurant.cuisine}</p>
            <p className="mt-1 truncate text-sm font-medium text-white/90">{restaurant.address}</p>
          </div>
        </Link>

        <div className="relative z-10 border-t border-[color-mix(in_srgb,var(--accent)_10%,var(--border))] bg-white p-4 md:absolute md:inset-x-0 md:bottom-0 md:border-t-0 md:translate-y-4 md:opacity-0 md:transition-all md:duration-300 md:ease-out md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <p className="text-sm leading-5 text-[var(--text-secondary)]">{restaurant.description}</p>

          {footer}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant={isWishlisted ? 'highlight' : 'secondary'}
              className={cn(
                'rounded-xl',
                isWishlisted
                  ? 'shadow-sm shadow-[color-mix(in_srgb,var(--secondary)_35%,transparent)]'
                  : 'border-[color-mix(in_srgb,var(--accent)_20%,var(--border))]',
              )}
              onClick={() => onToggleWishlist?.(restaurant.id)}
            >
              {isWishlisted ? 'Na lista' : 'Salvar'}
            </Button>
            <Button
              variant={isVisited ? 'primary' : 'secondary'}
              className={cn(
                'rounded-xl',
                isVisited
                  ? 'shadow-sm shadow-[color-mix(in_srgb,var(--primary)_35%,transparent)]'
                  : 'border-[color-mix(in_srgb,var(--accent)_20%,var(--border))]',
              )}
              onClick={() => onToggleVisited?.(restaurant.id)}
            >
              {isVisited ? 'Visitado' : 'Marcar visita'}
            </Button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm shadow-black/5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10">
      <Link to={`/restaurantes/${restaurant.id}`} className="block">
        <img
          src={getOptimizedImageUrl(restaurant.photos[0], { width: 720, height: 440 })}
          alt={`Foto do restaurante ${restaurant.name}`}
          className="h-44 w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link to={`/restaurantes/${restaurant.id}`} className="group">
            <h3 className="font-display text-lg text-[var(--text-primary)] group-hover:text-[var(--primary)]">
              {restaurant.name}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{restaurant.cuisine}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{formatPriceRange(restaurant.priceRange)}</Badge>
          <Badge variant="warm">⭐ {restaurant.stats.averageRating.toFixed(1)}</Badge>
          <Badge variant="neutral">{restaurant.stats.reviewsCount} reviews</Badge>
          <Badge variant="neutral">{restaurant.stats.visitsCount} visitas</Badge>
        </div>

        <p className="text-sm text-[var(--text-secondary)]">{restaurant.description}</p>
        <p className="text-sm text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">Localização:</span>{' '}
          {restaurant.address}
        </p>

        {footer}

        <div className="mt-auto flex gap-2">
          <Button
            variant={isWishlisted ? 'highlight' : 'secondary'}
            className="flex-1"
            onClick={() => onToggleWishlist?.(restaurant.id)}
          >
            {isWishlisted ? 'Na Lista' : 'Salvar'}
          </Button>
          <Button
            variant={isVisited ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => onToggleVisited?.(restaurant.id)}
          >
            {isVisited ? 'Visitado' : 'Marcar visita'}
          </Button>
        </div>
      </div>
    </article>
  )
}
