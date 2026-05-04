import { cn } from '../../utils/cn'

export function PageHeading({ title, description, action, variant = 'catalog', eyebrow, meta = [] }) {
  const sharedGradientShell =
    'relative isolate overflow-hidden rounded-[2.2rem] border border-[#f0cba9] bg-gradient-to-br from-[#fffaf4] via-[#ffffff] to-[#ffe6cc] shadow-[0_22px_65px_rgba(181,96,38,0.16)]'

  if (variant === 'catalog') {
    return (
      <section className={cn(sharedGradientShell, 'mb-6 p-5 lg:p-7')}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 bottom-16 size-64 rounded-full bg-[#ffd8ad]/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-16 size-72 rounded-full bg-[#f7bc73]/45 blur-3xl"
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
    <section className={cn(sharedGradientShell, 'mb-5 p-5 lg:mb-6 lg:p-7')}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-16 size-64 rounded-full bg-[#ffd8ad]/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-16 size-72 rounded-full bg-[#f7bc73]/45 blur-3xl"
      />

      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--text-primary)] lg:text-4xl">{title}</h1>
          {description && <p className="mt-2 text-sm text-[var(--text-secondary)] lg:text-base">{description}</p>}
        </div>
        {action}
      </div>
    </section>
  )
}
