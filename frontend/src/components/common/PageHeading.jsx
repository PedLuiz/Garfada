import { cn } from '../../utils/cn'

export function PageHeading({ title, description, action, variant = 'catalog', eyebrow, meta = [] }) {
  if (variant === 'catalog') {
    return (
      <section className="relative isolate mb-6 overflow-hidden rounded-[1.75rem] border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_12%,var(--surface))_0%,var(--surface)_46%,color-mix(in_srgb,var(--primary)_12%,var(--surface))_100%)] p-5 shadow-sm shadow-black/5 lg:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-[color-mix(in_srgb,var(--primary)_28%,transparent)] blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 left-10 h-32 w-56 rounded-full bg-[color-mix(in_srgb,var(--accent)_24%,transparent)] blur-2xl"
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {eyebrow && (
              <p className="inline-flex rounded-full border border-[color-mix(in_srgb,var(--accent)_20%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {eyebrow}
              </p>
            )}
            <h1 className={cn('mt-3 font-display text-3xl font-semibold text-[var(--text-primary)] lg:text-5xl')}>
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)] lg:text-base">{description}</p>
            )}

            {meta.length > 0 && (
              <dl className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {meta.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_16%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_82%,white_18%)] px-3 py-2.5"
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {action}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-5 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--text-primary)] lg:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-[var(--text-secondary)] lg:text-base">{description}</p>}
      </div>
      {action}
    </section>
  )
}
