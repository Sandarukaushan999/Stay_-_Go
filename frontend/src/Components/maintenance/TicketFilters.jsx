// TicketFilters component - compact inline filter bar
// Filters: status, priority, category, search, sort

const selectClasses = 'rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500'

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
  // Handle when user changes any filter
  function handleChange(filterName, value) {
    onFilterChange({ ...filters, [filterName]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs font-medium text-slate-500">Filters</span>

      {/* Status filter */}
      <select className={selectClasses} value={filters.status || ''} onChange={(e) => handleChange('status', e.target.value)} aria-label="Filter by status">
        <option value="">All Status</option>
        <option value="submitted">Submitted</option>
        <option value="assigned">Assigned</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* Priority filter */}
      <select className={selectClasses} value={filters.priority || ''} onChange={(e) => handleChange('priority', e.target.value)} aria-label="Filter by priority">
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="emergency">Emergency</option>
      </select>

      {/* Category filter */}
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

      {/* Sort dropdown */}
      {onSortChange && (
        <select className={selectClasses} value={sortBy || 'newest'} onChange={(e) => onSortChange(e.target.value)} aria-label="Sort by">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">Priority (Highest)</option>
        </select>
      )}

      {/* Search input */}
      {showSearch && (
        <input
          type="text"
          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500"
          placeholder="Search ID, title, or room..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          aria-label="Search tickets"
        />
      )}

      {/* Result count */}
      {totalCount !== undefined && (
        <span className="ml-auto text-xs text-slate-500">
          {resultCount} of {totalCount} tickets
        </span>
      )}

      {/* Clear all */}
      <button
        type="button"
        className="rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-emerald-50 hover:text-slate-900"
        onClick={() => onFilterChange({ status: '', priority: '', category: '', search: '' })}
      >
        Clear
      </button>
    </div>
  )
}

export default TicketFilters
