export default function Table({ columns = [], rows = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-950">
          <tr className="text-slate-300">
            {columns.map((c) => (
              <th key={c.key} className="p-3">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-slate-900/30">
          {rows?.length ? (
            rows.map((r, idx) => (
              <tr key={r.id ?? r._id ?? idx} className="border-t border-slate-800">
                {columns.map((c) => (
                  <td key={c.key} className="p-3 text-slate-200">
                    {String(r?.[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-3 text-slate-400" colSpan={columns.length || 1}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

