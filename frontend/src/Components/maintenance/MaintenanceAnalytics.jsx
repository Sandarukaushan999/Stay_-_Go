// MaintenanceAnalytics - Admin analytics dashboard
// Calculates all KPIs client-side from the tickets array
// Uses simple div-based bar charts (no external chart library)

function MaintenanceAnalytics({ tickets }) {
  // ============================================
  // KPI CALCULATIONS
  // ============================================

  const totalTickets = tickets.length

  const openTickets = tickets.filter(
    (t) => t.status !== 'closed' && t.status !== 'rejected'
  ).length

  // Average resolution time in hours
  // Calculated from first statusHistory entry to the 'resolved' entry
  function calcAvgResolutionHours() {
    const resolved = tickets.filter((t) =>
      t.statusHistory?.some((h) => h.status === 'resolved')
    )
    if (resolved.length === 0) return 0

    let totalHours = 0
    resolved.forEach((t) => {
      const submitted = t.statusHistory.find((h) => h.status === 'submitted')
      const resolvedEntry = t.statusHistory.find((h) => h.status === 'resolved')
      if (submitted && resolvedEntry) {
        const diff = new Date(resolvedEntry.changedAt) - new Date(submitted.changedAt)
        totalHours += diff / (1000 * 60 * 60)
      }
    })
    return (totalHours / resolved.length).toFixed(1)
  }
  const avgResolution = calcAvgResolutionHours()

  // Average student satisfaction rating
  const ratedTickets = tickets.filter((t) => t.rating != null)
  const avgRating =
    ratedTickets.length > 0
      ? (ratedTickets.reduce((sum, t) => sum + t.rating, 0) / ratedTickets.length).toFixed(1)
      : '—'

  // ============================================
  // PRIORITY BREAKDOWN
  // ============================================
  const priorities = ['low', 'medium', 'high', 'emergency']
  const priorityColors = {
    low: 'bg-slate-500',
    medium: 'bg-blue-500',
    high: 'bg-amber-500',
    emergency: 'bg-red-500',
  }
  const priorityCounts = {}
  priorities.forEach((p) => {
    priorityCounts[p] = tickets.filter((t) => t.priority === p).length
  })
  const maxPriority = Math.max(...Object.values(priorityCounts), 1)

  // ============================================
  // STATUS BREAKDOWN
  // ============================================
  const statuses = ['submitted', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']
  const statusLabels = {
    submitted: 'Submitted',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
    rejected: 'Rejected',
  }
  const statusColors = {
    submitted: 'bg-slate-500',
    assigned: 'bg-violet-500',
    in_progress: 'bg-amber-500',
    resolved: 'bg-emerald-500',
    closed: 'bg-slate-600',
    rejected: 'bg-red-500',
  }
  const statusCounts = {}
  statuses.forEach((s) => {
    statusCounts[s] = tickets.filter((t) => t.status === s).length
  })
  const maxStatus = Math.max(...Object.values(statusCounts), 1)

  // ============================================
  // TICKETS BY HOSTEL BLOCK
  // ============================================
  const blocks = ['A', 'B', 'C', 'D', 'E', 'F']
  const blockCounts = {}
  blocks.forEach((b) => {
    blockCounts[b] = tickets.filter((t) => t.hostelBlock === b).length
  })
  const maxBlock = Math.max(...Object.values(blockCounts), 1)

  // ============================================
  // TECHNICIAN PERFORMANCE
  // ============================================
  function calcTechPerformance() {
    const techMap = {}

    tickets.forEach((t) => {
      if (!t.assignedTo) return
      const techId = t.assignedTo._id || t.assignedTo.id
      const techName = t.assignedTo.fullName || 'Unknown'

      if (!techMap[techId]) {
        techMap[techId] = { name: techName, assigned: 0, resolved: 0, totalRating: 0, ratedCount: 0 }
      }
      techMap[techId].assigned += 1

      if (['resolved', 'closed'].includes(t.status)) {
        techMap[techId].resolved += 1
      }
      if (t.rating != null) {
        techMap[techId].totalRating += t.rating
        techMap[techId].ratedCount += 1
      }
    })

    return Object.values(techMap)
      .map((tech) => ({
        ...tech,
        avgRating: tech.ratedCount > 0 ? (tech.totalRating / tech.ratedCount).toFixed(1) : '—',
      }))
      .sort((a, b) => {
        if (a.avgRating === '—' && b.avgRating === '—') return 0
        if (a.avgRating === '—') return 1
        if (b.avgRating === '—') return -1
        return parseFloat(b.avgRating) - parseFloat(a.avgRating)
      })
  }
  const techPerformance = calcTechPerformance()

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Total Tickets" value={totalTickets} accent="text-violet-400" />
        <KPICard label="Open Tickets" value={openTickets} accent="text-amber-400" />
        <KPICard label="Avg Resolution" value={`${avgResolution}h`} accent="text-emerald-400" />
        <KPICard
          label="Satisfaction"
          value={avgRating === '—' ? '—' : `${avgRating}/5`}
          accent="text-violet-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priority Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-300">Priority Breakdown</h3>
          <div className="space-y-3">
            {priorities.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <span className="w-20 text-xs capitalize text-slate-400">{p}</span>
                <div className="flex-1">
                  <div className="h-5 rounded-full bg-slate-800">
                    <div
                      className={`h-5 rounded-full ${priorityColors[p]} transition-all duration-500`}
                      style={{ width: `${(priorityCounts[p] / maxPriority) * 100}%`, minWidth: priorityCounts[p] > 0 ? '1.5rem' : 0 }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-xs font-medium text-slate-300">
                  {priorityCounts[p]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-300">Status Breakdown</h3>
          <div className="space-y-3">
            {statuses.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-20 text-xs text-slate-400">{statusLabels[s]}</span>
                <div className="flex-1">
                  <div className="h-5 rounded-full bg-slate-800">
                    <div
                      className={`h-5 rounded-full ${statusColors[s]} transition-all duration-500`}
                      style={{ width: `${(statusCounts[s] / maxStatus) * 100}%`, minWidth: statusCounts[s] > 0 ? '1.5rem' : 0 }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-xs font-medium text-slate-300">
                  {statusCounts[s]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets by Hostel Block */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">Tickets by Hostel Block</h3>
        <div className="space-y-3">
          {blocks.map((b) => (
            <div key={b} className="flex items-center gap-3">
              <span className="w-16 text-xs font-medium text-slate-400">Block {b}</span>
              <div className="flex-1">
                <div className="h-6 rounded-full bg-slate-800">
                  <div
                    className="h-6 rounded-full bg-violet-600 transition-all duration-500"
                    style={{ width: `${(blockCounts[b] / maxBlock) * 100}%`, minWidth: blockCounts[b] > 0 ? '1.5rem' : 0 }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-xs font-medium text-slate-300">
                {blockCounts[b]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Technician Performance Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">Technician Performance</h3>
        {techPerformance.length === 0 ? (
          <p className="text-sm text-slate-500">No technician data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Technician</th>
                  <th className="pb-2 pr-4 font-medium">Assigned</th>
                  <th className="pb-2 pr-4 font-medium">Resolved</th>
                  <th className="pb-2 font-medium">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {techPerformance.map((tech) => (
                  <tr key={tech.name} className="text-slate-300">
                    <td className="py-2.5 pr-4 font-medium text-slate-200">{tech.name}</td>
                    <td className="py-2.5 pr-4">{tech.assigned}</td>
                    <td className="py-2.5 pr-4">{tech.resolved}</td>
                    <td className="py-2.5">
                      {tech.avgRating === '—' ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        <span className="text-amber-400">{tech.avgRating}/5</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// KPI Card sub-component
// ============================================
function KPICard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

export default MaintenanceAnalytics
