export default function Footer({ onNavigateToPage }) {
  const links = [
    { label: 'Privacy', value: 'privacy' },
    { label: 'Support', value: 'support' },
  ]

  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">STAY & GO</div>
          <div className="mt-1 text-xs text-slate-500">Unified smart campus platform</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => onNavigateToPage?.(l.value)}
              className="rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}

