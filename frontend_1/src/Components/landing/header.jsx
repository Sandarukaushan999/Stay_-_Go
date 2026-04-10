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
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={onBrandClick}
          className="flex items-center gap-2 rounded-xl px-2 py-1 text-left hover:bg-slate-900"
        >
          <span className="text-sm font-semibold tracking-wide text-white">STAY & GO</span>
          <span className="hidden text-xs text-slate-400 sm:inline">Smart campus platform</span>
        </button>

        <nav aria-label={navAriaLabel} className="hidden items-center gap-2 md:flex">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
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
                  ? 'rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500'
                  : 'rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900'
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-800 px-3 py-2 text-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-800 bg-slate-950 md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="grid gap-2">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    item.onClick?.()
                  }}
                  className="rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900"
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
                        ? 'rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500'
                        : 'rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900'
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

