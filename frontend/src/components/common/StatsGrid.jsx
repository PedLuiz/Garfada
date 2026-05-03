export function StatsGrid({ stats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
          <p className="mt-1 font-display text-2xl text-[var(--text-primary)]">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
