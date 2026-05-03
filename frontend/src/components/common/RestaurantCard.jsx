import { Link } from 'react-router-dom'
import { formatPriceRange } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export function RestaurantCard({
  restaurant,
  isWishlisted = false,
  isVisited = false,
  onToggleWishlist,
  onToggleVisited,
  footer,
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm shadow-black/5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10">
      <Link to={`/restaurantes/${restaurant.id}`} className="block">
        <img
          src={restaurant.photos[0]}
          alt={`Foto do restaurante ${restaurant.name}`}
          className="h-44 w-full object-cover"
          loading="lazy"
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
