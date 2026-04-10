import { useMemo, useState } from 'react'

export default function Header({
  navItems = [],
  actionItems = [],
  onBrandClick,
  navAriaLabel = 'Primary',
}) {
  const [open, setOpen] = useState(false)
  const items = useMemo(() => navItems ?? [], [navItems])

  return (
    <header className="sticky top-0 z-20 border-b border-[#101312]/15 bg-white/95 backdrop-blur">
      <div className="w-full px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBrandClick}
            className="flex items-center gap-2 rounded-xl px-2 py-1 text-left transition hover:bg-[#E2FF99]"
          >
            <span className="text-sm font-semibold tracking-wide text-[#101312]">STAY &amp; GO</span>
            <span className="hidden text-xs text-[#101312]/65 sm:inline">Smart campus platform</span>
          </button>

          <nav aria-label={navAriaLabel} className="hidden items-center gap-2 md:flex">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="rounded-xl px-3 py-2 text-sm font-medium text-[#101312]/80 transition hover:bg-[#E2FF99] hover:text-[#101312]"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {actionItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={
                  item.variant === 'button-primary'
                    ? 'rounded-xl bg-[#BAF91A] px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]'
                    : 'rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]'
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99] md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[#101312]/15 bg-white md:hidden">
          <div className="w-full px-4 py-3 sm:px-6 lg:px-8">
            <div className="grid gap-2">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    item.onClick?.()
                  }}
                  className="rounded-xl px-3 py-2 text-left text-sm font-medium text-[#101312]/80 transition hover:bg-[#E2FF99]"
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-2 grid gap-2">
                {actionItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      item.onClick?.()
                    }}
                    className={
                      item.variant === 'button-primary'
                        ? 'rounded-xl bg-[#BAF91A] px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]'
                        : 'rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]'
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
