import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-[var(--primary)] text-white hover:bg-[#d77904] focus-visible:outline-[var(--primary)] shadow-sm shadow-black/10',
  secondary:
    'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--primary)] focus-visible:outline-[var(--primary)]',
  ghost:
    'bg-transparent text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] focus-visible:outline-[var(--accent)]',
  highlight:
    'bg-[var(--secondary)] text-white hover:bg-[#bd4f31] focus-visible:outline-[var(--secondary)] shadow-sm shadow-black/10',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" aria-hidden="true" />
          Carregando
        </>
      ) : (
        children
      )}
    </button>
  )
}
