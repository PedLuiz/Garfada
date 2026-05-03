import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { formatDate } from '../../utils/format'

export function ReviewCard({ review }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/usuarios/${review.user.id}`} className="flex items-center gap-3">
          <Avatar src={review.user.avatarUrl} name={review.user.name} size="sm" />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{review.user.name}</p>
            <p className="text-xs text-[var(--text-secondary)]">@{review.user.username}</p>
          </div>
        </Link>

        <div className="text-right">
          <p className="text-sm font-semibold text-[var(--primary)]">⭐ {review.rating.toFixed(1)}</p>
          <p className="text-xs text-[var(--text-secondary)]">{formatDate(review.createdAt)}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{review.comment}</p>
    </article>
  )
}
