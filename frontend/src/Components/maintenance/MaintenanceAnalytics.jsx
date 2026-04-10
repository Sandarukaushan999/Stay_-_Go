// MaintenanceAnalytics - Admin analytics dashboard
// All hardcoded hex colors to avoid tailwind config remapping issues

function MaintenanceAnalytics({ tickets }) {
  const totalTickets = tickets.length
  const openTickets = tickets.filter((t) => t.status !== 'closed' && t.status !== 'rejected').length

  function calcAvgResolutionHours() {
    const resolved = tickets.filter((t) => t.statusHistory?.some((h) => h.status === 'resolved'))
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

  const ratedTickets = tickets.filter((t) => t.rating != null)
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((sum, t) => sum + t.rating, 0) / ratedTickets.length).toFixed(1)
    : '—'

  // Priority data
  const priorities = ['low', 'medium', 'high', 'emergency']
  const priorityMeta = {
    low: { color: '#94a3b8', label: 'Low' },
    medium: { color: '#876DFF', label: 'Medium' },
    high: { color: '#f59e0b', label: 'High' },
    emergency: { color: '#e53e3e', label: 'Emergency' },
  }
  const priorityCounts = {}
  priorities.forEach((p) => { priorityCounts[p] = tickets.filter((t) => t.priority === p).length })
  const maxPriority = Math.max(...Object.values(priorityCounts), 1)

  // Status data
  const statuses = ['submitted', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']
  const statusMeta = {
    submitted: { color: '#94a3b8', label: 'Submitted' },
    assigned: { color: '#876DFF', label: 'Assigned' },
    in_progress: { color: '#f59e0b', label: 'In Progress' },
    resolved: { color: '#22c55e', label: 'Resolved' },
    closed: { color: '#64748b', label: 'Closed' },
    rejected: { color: '#e53e3e', label: 'Rejected' },
  }
  const statusCounts = {}
  statuses.forEach((s) => { statusCounts[s] = tickets.filter((t) => t.status === s).length })
  const maxStatus = Math.max(...Object.values(statusCounts), 1)

  // Block data
  const blocks = ['A', 'B', 'C', 'D', 'E', 'F']
  const blockCounts = {}
  blocks.forEach((b) => { blockCounts[b] = tickets.filter((t) => t.hostelBlock === b).length })
  const maxBlock = Math.max(...Object.values(blockCounts), 1)

  // Technician performance
  function calcTechPerformance() {
    const techMap = {}
    tickets.forEach((t) => {
      if (!t.assignedTo || typeof t.assignedTo === 'string') return
      const techId = t.assignedTo._id || t.assignedTo.id || t.assignedTo
      const techName = t.assignedTo.fullName || t.assignedTo.name || 'Unknown'
      if (!techMap[techId]) techMap[techId] = { name: techName, assigned: 0, resolved: 0, totalRating: 0, ratedCount: 0 }
      techMap[techId].assigned += 1
      if (['resolved', 'closed'].includes(t.status)) techMap[techId].resolved += 1
      if (t.rating != null) { techMap[techId].totalRating += t.rating; techMap[techId].ratedCount += 1 }
    })
    return Object.values(techMap)
      .map((tech) => ({ ...tech, avgRating: tech.ratedCount > 0 ? (tech.totalRating / tech.ratedCount).toFixed(1) : '—' }))
      .sort((a, b) => {
        if (a.avgRating === '—' && b.avgRating === '—') return 0
        if (a.avgRating === '—') return 1
        if (b.avgRating === '—') return -1
        return parseFloat(b.avgRating) - parseFloat(a.avgRating)
      })
  }
  const techPerformance = calcTechPerformance()

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
          <p className="text-xs font-medium text-[#101312]/75">Total Tickets</p>
          <p className="mt-2 text-3xl font-bold text-[#101312]">{totalTickets}</p>
        </div>
        <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
          <p className="text-xs font-medium text-[#101312]/75">Open Tickets</p>
          <p className="mt-2 text-3xl font-bold text-[#876DFF]">{openTickets}</p>
        </div>
        <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
          <p className="text-xs font-medium text-[#101312]/75">Avg Resolution</p>
          <p className="mt-2 text-3xl font-bold text-[#101312]">{avgResolution}<span className="text-lg font-medium text-[#101312]/75">h</span></p>
        </div>
        <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
          <p className="text-xs font-medium text-[#101312]/75">Satisfaction</p>
          <p className="mt-2 text-3xl font-bold text-[#f59e0b]">{avgRating === '—' ? '—' : avgRating}<span className="text-lg font-medium text-[#101312]/75">{avgRating !== '—' ? '/5' : ''}</span></p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priority Breakdown */}
        <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
          <h3 className="mb-5 text-sm font-semibold text-[#101312]">Priority Breakdown</h3>
          <div className="space-y-4">
            {priorities.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium text-[#101312]/80">{priorityMeta[p].label}</span>
                <div className="flex-1">
                  <div className="h-6 rounded-full bg-[#101312]/[0.04]">
                    <div
                      className="h-6 rounded-full transition-all duration-500"
                      style={{
                        width: `${(priorityCounts[p] / maxPriority) * 100}%`,
                        minWidth: priorityCounts[p] > 0 ? '1.5rem' : 0,
                        backgroundColor: priorityMeta[p].color,
                      }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-sm font-bold text-[#101312]">{priorityCounts[p]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
          <h3 className="mb-5 text-sm font-semibold text-[#101312]">Status Breakdown</h3>
          <div className="space-y-4">
            {statuses.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium text-[#101312]/80">{statusMeta[s].label}</span>
                <div className="flex-1">
                  <div className="h-6 rounded-full bg-[#101312]/[0.04]">
                    <div
                      className="h-6 rounded-full transition-all duration-500"
                      style={{
                        width: `${(statusCounts[s] / maxStatus) * 100}%`,
                        minWidth: statusCounts[s] > 0 ? '1.5rem' : 0,
                        backgroundColor: statusMeta[s].color,
                      }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-sm font-bold text-[#101312]">{statusCounts[s]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets by Hostel Block */}
      <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
        <h3 className="mb-5 text-sm font-semibold text-[#101312]">Tickets by Hostel Block</h3>
        <div className="space-y-4">
          {blocks.map((b, i) => {
            const blockColors = ['#876DFF', '#BAF91A', '#f59e0b', '#22c55e', '#3b82f6', '#e53e3e']
            return (
              <div key={b} className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium text-[#101312]/80">Block {b}</span>
                <div className="flex-1">
                  <div className="h-7 rounded-full bg-[#101312]/[0.04]">
                    <div
                      className="h-7 rounded-full transition-all duration-500"
                      style={{
                        width: `${(blockCounts[b] / maxBlock) * 100}%`,
                        minWidth: blockCounts[b] > 0 ? '1.5rem' : 0,
                        backgroundColor: blockColors[i],
                      }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-sm font-bold text-[#101312]">{blockCounts[b]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Technician Performance Table */}
      <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
        <h3 className="mb-5 text-sm font-semibold text-[#101312]">Technician Performance</h3>
        {techPerformance.length === 0 ? (
          <p className="text-sm text-[#101312]/75">No technician data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#101312]/10 text-xs text-[#101312]/75">
                  <th className="pb-3 pr-4 font-medium">Technician</th>
                  <th className="pb-3 pr-4 font-medium">Assigned</th>
                  <th className="pb-3 pr-4 font-medium">Resolved</th>
                  <th className="pb-3 font-medium">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#101312]/5">
                {techPerformance.map((tech) => (
                  <tr key={tech.name} className="text-[#101312]/80 transition hover:bg-[#101312]/[0.02]">
                    <td className="py-3 pr-4 font-medium text-[#101312]">{tech.name}</td>
                    <td className="py-3 pr-4">{tech.assigned}</td>
                    <td className="py-3 pr-4">{tech.resolved}</td>
                    <td className="py-3">
                      {tech.avgRating === '—' ? (
                        <span className="text-[#101312]/40">—</span>
                      ) : (
                        <span className="font-semibold text-[#f59e0b]">{tech.avgRating}/5</span>
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

export default MaintenanceAnalytics
