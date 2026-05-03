import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { formatDate, formatFeedAction } from '../../utils/format'

const typeVariant = {
  review: 'warm',
  visited: 'success',
  wishlist: 'neutral',
  follow: 'neutral',
}

export function FeedActivityCard({ item }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={item.user.avatarUrl} name={item.user.name} size="sm" />
          <div>
            <p className="text-sm text-[var(--text-primary)]">
              <Link to={`/usuarios/${item.user.id}`} className="font-semibold hover:text-[var(--primary)]">
                {item.user.name}
              </Link>{' '}
              <span className="text-[var(--text-secondary)]">{formatFeedAction(item.type)}</span>{' '}
              {item.restaurant && (
                <Link
                  to={`/restaurantes/${item.restaurant.id}`}
                  className="font-semibold text-[var(--accent)] hover:underline"
                >
                  {item.restaurant.name}
                </Link>
              )}
              {item.targetUser && (
                <Link
                  to={`/usuarios/${item.targetUser.id}`}
                  className="font-semibold text-[var(--accent)] hover:underline"
                >
                  @{item.targetUser.username}
                </Link>
              )}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{formatDate(item.createdAt)}</p>
          </div>
        </div>

        <Badge variant={typeVariant[item.type] ?? 'neutral'}>{item.type}</Badge>
      </div>

      {item.review?.comment && (
        <p className="mt-3 rounded-xl bg-[color-mix(in_srgb,var(--bg)_85%,white_15%)] p-3 text-sm text-[var(--text-secondary)]">
          “{item.review.comment}”
        </p>
      )}
    </article>
  )
}
