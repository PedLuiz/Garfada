export function PageHeading({ title, description, action }) {
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
