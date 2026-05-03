import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

export function UserPreviewCard({ user, onFollow }) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <Link to={`/usuarios/${user.id}`} className="flex items-center gap-3">
        <Avatar src={user.avatarUrl} name={user.name} size="sm" />
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</p>
          <p className="text-xs text-[var(--text-secondary)]">@{user.username}</p>
        </div>
      </Link>

      <Button size="sm" variant={user.isFollowing ? 'secondary' : 'primary'} onClick={() => onFollow(user.id)}>
        {user.isFollowing ? 'Seguindo' : 'Seguir'}
      </Button>
    </article>
  )
}
