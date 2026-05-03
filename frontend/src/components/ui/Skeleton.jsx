import { cn } from '../../utils/cn'

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-[color-mix(in_srgb,var(--border)_80%,transparent)]', className)} />
}
