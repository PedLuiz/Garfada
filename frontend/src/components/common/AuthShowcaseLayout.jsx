export function AuthShowcaseLayout({
  imageSrc,
  imageAlt,
  imageTitle,
  imageDescription,
  children,
  panelBadge,
  panelPills = [],
  panelCompact = false,
  panelTextClassName = 'text-white',
  imageTitleClassName,
  imageTitleStyle = { color: '#ffffff' },
}) {
  return (
    <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#efc9a9] bg-white shadow-[0_24px_64px_rgba(176,94,35,0.14)]">
      <div className="grid lg:grid-cols-[1.06fr_0.94fr]">
        <div className="bg-gradient-to-br from-white via-[#fff8ef] to-[#fff1e3] p-6 sm:p-8 lg:p-10">{children}</div>

        <aside className="relative hidden min-h-full lg:block">
          <img src={imageSrc} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1108]/90 via-[#42200f]/45 to-[#a44d1f]/15" />

          <div
            className={`absolute inset-x-7 bottom-7 rounded-3xl border border-white/25 bg-white/10 p-5 backdrop-blur-sm [&_*]:text-white ${panelTextClassName}`}
          >
            {panelBadge && (
              <p className="inline-flex rounded-full border border-white/45 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                {panelBadge}
              </p>
            )}
            <h2
              className={`${panelBadge ? 'mt-3' : ''} font-display text-3xl leading-tight ${imageTitleClassName ?? ''}`}
              style={imageTitleStyle}
            >
              {imageTitle}
            </h2>
            {!panelCompact && imageDescription && <p className="mt-2 text-sm leading-relaxed text-white">{imageDescription}</p>}

            {!panelCompact && panelPills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {panelPills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-white/45 bg-white/10 px-3 py-1 text-xs font-medium text-white"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
