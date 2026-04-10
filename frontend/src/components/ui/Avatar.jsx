import { getInitials } from '../../utils/format'
import { cn } from '../../utils/cn'

export function Avatar({ src, name, size = 'md', className }) {
  const sizes = {
    sm: 'size-9 text-xs',
    md: 'size-11 text-sm',
    lg: 'size-16 text-lg',
    xl: 'size-24 text-2xl',
  }

  return src ? (
    <img
      src={src}
      alt={`Avatar de ${name}`}
      className={cn('rounded-full border border-[var(--border)] object-cover', sizes[size], className)}
    />
  ) : (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-semibold text-[var(--accent)]',
        sizes[size],
        className,
      )}
      aria-label={`Avatar de ${name}`}
    >
      {getInitials(name)}
    </div>
  )
}
