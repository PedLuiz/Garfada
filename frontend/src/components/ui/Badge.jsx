import { cn } from '../../utils/cn'

const variants = {
  neutral: 'bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] text-[var(--accent)]',
  warm: 'bg-[color-mix(in_srgb,var(--highlight)_25%,var(--surface))] text-[var(--deep-accent)]',
  success: 'bg-[color-mix(in_srgb,#22c55e_20%,var(--surface))] text-[#166534]',
  danger: 'bg-[color-mix(in_srgb,var(--secondary)_18%,var(--surface))] text-[var(--deep-accent)]',
}

export function Badge({ children, variant = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
