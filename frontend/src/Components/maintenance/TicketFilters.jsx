// TicketFilters component - compact inline filter bar
// Using hardcoded hex colors for consistency

const selectClasses = 'rounded-xl border border-[#101312]/15 bg-white px-3 py-1.5 text-xs text-[#101312] outline-none focus:border-[#876DFF] focus:ring-1 focus:ring-[#876DFF]/20'

function TicketFilters({
  filters,
  onFilterChange,
  showCategory = true,
  showSearch = false,
  sortBy,
  onSortChange,
  resultCount,
  totalCount,
}) {
  function handleChange(filterName, value) {
    onFilterChange({ ...filters, [filterName]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#101312]/10 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
      <span className="text-xs font-semibold text-[#101312]/75">Filters</span>

      <select className={selectClasses} value={filters.status || ''} onChange={(e) => handleChange('status', e.target.value)} aria-label="Filter by status">
        <option value="">All Status</option>
        <option value="submitted">Submitted</option>
        <option value="assigned">Assigned</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
        <option value="rejected">Rejected</option>
      </select>

      <select className={selectClasses} value={filters.priority || ''} onChange={(e) => handleChange('priority', e.target.value)} aria-label="Filter by priority">
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="emergency">Emergency</option>
      </select>

      {showCategory && (
        <select className={selectClasses} value={filters.category || ''} onChange={(e) => handleChange('category', e.target.value)} aria-label="Filter by category">
          <option value="">All Categories</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="furniture">Furniture</option>
          <option value="cleaning">Cleaning</option>
          <option value="network">Network</option>
          <option value="other">Other</option>
        </select>
      )}

      {onSortChange && (
        <select className={selectClasses} value={sortBy || 'newest'} onChange={(e) => onSortChange(e.target.value)} aria-label="Sort by">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">Priority (Highest)</option>
        </select>
      )}

      {showSearch && (
        <input
          type="text"
          className="rounded-xl border border-[#101312]/15 bg-white px-3 py-1.5 text-xs text-[#101312] placeholder-[#101312]/50 outline-none focus:border-[#876DFF] focus:ring-1 focus:ring-[#876DFF]/20"
          placeholder="Search ID, title, or room..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          aria-label="Search tickets"
        />
      )}

      {totalCount !== undefined && (
        <span className="ml-auto text-xs font-medium text-[#876DFF]">
          {resultCount} of {totalCount} tickets
        </span>
      )}

      <button
        type="button"
        className="rounded-lg px-2 py-1 text-xs text-[#101312]/80 transition hover:bg-[#101312]/5 hover:text-[#101312]"
        onClick={() => onFilterChange({ status: '', priority: '', category: '', search: '' })}
      >
        Clear
      </button>
    </div>
  )
}

export default TicketFilters
