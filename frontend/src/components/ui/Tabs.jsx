import { cn } from '../../utils/cn'

export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
              isActive
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
