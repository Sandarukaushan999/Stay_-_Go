// Announcements component - dual view for admin and student/technician
// Admin: create, edit, delete, toggle announcements
// Non-admin: read-only list of active announcements

import { useState } from 'react'

const priorityStyles = {
  urgent: { border: 'border-l-[#e53e3e]', bg: 'bg-white', badge: 'bg-[#e53e3e]/10 text-[#e53e3e] border border-[#e53e3e]/20' },
  important: { border: 'border-l-[#f59e0b]', bg: 'bg-white', badge: 'bg-[#f59e0b]/10 text-[#d97706] border border-[#f59e0b]/20' },
  normal: { border: 'border-l-[#101312]/15', bg: 'bg-white', badge: 'bg-[#101312]/5 text-[#101312]/75 border border-[#101312]/10' },
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-LK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Reusable priority badge
function AnnouncementPriorityBadge({ priority }) {
  const style = priorityStyles[priority] || priorityStyles.normal
  const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Normal'
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}>
      {label}
    </span>
  )
}

// Empty form values
const emptyForm = { title: '', content: '', priority: 'normal' }

function Announcements({ announcements = [], userRole, onCreate, onUpdate, onDelete, onToggle }) {
  // Form state for creating
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ ...emptyForm })

  // Editing state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ ...emptyForm })

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const isAdmin = userRole === 'admin' || userRole === 'super_admin'

  // Validation helpers
  function isCreateValid() {
    return createForm.title.length >= 5 && createForm.title.length <= 100 &&
           createForm.content.length >= 20 && createForm.content.length <= 500
  }

  function isEditValid() {
    return editForm.title.length >= 5 && editForm.title.length <= 100 &&
           editForm.content.length >= 20 && editForm.content.length <= 500
  }

  // Create handlers
  function handleCreate() {
    if (!isCreateValid()) return
    onCreate({ title: createForm.title, content: createForm.content, priority: createForm.priority })
    setCreateForm({ ...emptyForm })
    setShowCreate(false)
  }

  // Edit handlers
  function startEdit(announcement) {
    setEditingId(announcement._id || announcement.id)
    setEditForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority || 'normal',
    })
  }

  function handleUpdate() {
    if (!isEditValid()) return
    onUpdate(editingId, { title: editForm.title, content: editForm.content, priority: editForm.priority })
    setEditingId(null)
    setEditForm({ ...emptyForm })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ ...emptyForm })
  }

  // Delete handlers
  function confirmDelete() {
    if (deleteConfirm) {
      onDelete(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  // Sorted announcements (newest first)
  const sorted = [...announcements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const visibleAnnouncements = isAdmin ? sorted : sorted.filter((a) => a.isActive)

  // Admin view
  if (isAdmin) {
    return (
      <div className="space-y-4">
        {/* Create button / form */}
        {!showCreate ? (
          <button
            type="button"
            className="rounded-xl bg-[#BAF91A] px-4 py-2 text-sm font-medium text-[#101312] transition hover:bg-[#a9ea00]"
            onClick={() => setShowCreate(true)}
          >
            Create New
          </button>
        ) : (
          <div className="rounded-2xl border border-[#101312]/10 bg-white p-5">
            <h3 className="text-sm font-semibold text-[#101312]">New Announcement</h3>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#101312]/75" htmlFor="create-title">Title</label>
                <input
                  id="create-title"
                  type="text"
                  className="mt-1 w-full rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-sm text-[#101312] placeholder-[#101312]/40 outline-none focus:border-[#101312]/40"
                  placeholder="Announcement title (5-100 characters)"
                  maxLength={100}
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                />
                <p className="mt-0.5 text-xs text-[#101312]/75">
                  {createForm.title.length}/100
                  {createForm.title.length > 0 && createForm.title.length < 5 && (
                    <span className="ml-2 text-[#e53e3e]">Min 5 characters required</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#101312]/75" htmlFor="create-content">Content</label>
                <textarea
                  id="create-content"
                  className="mt-1 w-full rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-sm text-[#101312] placeholder-[#101312]/40 outline-none focus:border-[#101312]/40"
                  rows={4}
                  placeholder="Announcement content (20-500 characters)"
                  maxLength={500}
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                />
                <p className="mt-0.5 text-xs text-[#101312]/75">
                  {createForm.content.length}/500
                  {createForm.content.length > 0 && createForm.content.length < 20 && (
                    <span className="ml-2 text-[#e53e3e]">Min 20 characters required</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#101312]/75" htmlFor="create-priority">Priority</label>
                <select
                  id="create-priority"
                  className="mt-1 rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-sm text-[#101312] outline-none focus:border-[#101312]/40"
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-[#BAF91A] px-4 py-1.5 text-xs font-medium text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-40"
                disabled={!isCreateValid()}
                onClick={handleCreate}
              >
                Publish
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#101312]/15 bg-white px-3 py-1.5 text-xs text-[#101312]/80 transition hover:bg-[#101312]/5"
                onClick={() => { setShowCreate(false); setCreateForm({ ...emptyForm }) }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Announcements list */}
        {visibleAnnouncements.length === 0 && (
          <p className="py-8 text-center text-sm text-[#101312]/75">No announcements yet.</p>
        )}

        {visibleAnnouncements.map((item) => {
          const itemId = item._id || item.id
          const style = priorityStyles[item.priority] || priorityStyles.normal
          const isEditing = editingId === itemId

          return (
            <div
              key={itemId}
              className={`rounded-2xl border border-[#101312]/10 border-l-4 ${style.border} ${style.bg} p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)] transition ${!item.isActive ? 'opacity-50' : ''}`}
            >
              {isEditing ? (
                // Inline edit form
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#101312]/75">Title</label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-sm text-[#101312] outline-none focus:border-[#101312]/40"
                      maxLength={100}
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                    <p className="mt-0.5 text-xs text-[#101312]/75">
                      {editForm.title.length}/100
                      {editForm.title.length > 0 && editForm.title.length < 5 && (
                        <span className="ml-2 text-[#e53e3e]">Min 5 characters required</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#101312]/75">Content</label>
                    <textarea
                      className="mt-1 w-full rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-sm text-[#101312] outline-none focus:border-[#101312]/40"
                      rows={4}
                      maxLength={500}
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    />
                    <p className="mt-0.5 text-xs text-[#101312]/75">
                      {editForm.content.length}/500
                      {editForm.content.length > 0 && editForm.content.length < 20 && (
                        <span className="ml-2 text-[#e53e3e]">Min 20 characters required</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#101312]/75">Priority</label>
                    <select
                      className="mt-1 rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-sm text-[#101312] outline-none focus:border-[#101312]/40"
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-[#BAF91A] px-4 py-1.5 text-xs font-medium text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-40"
                      disabled={!isEditValid()}
                      onClick={handleUpdate}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#101312]/15 bg-white px-3 py-1.5 text-xs text-[#101312]/80 transition hover:bg-[#101312]/5"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display view
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#101312]">{item.title}</h3>
                        <AnnouncementPriorityBadge priority={item.priority} />
                        {!item.isActive && (
                          <span className="rounded-full bg-[#101312]/5 px-2 py-0.5 text-xs text-[#101312]/75">Inactive</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[#101312]/75">{item.content}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-[#101312]/75">
                        <span>{formatDate(item.createdAt)}</span>
                        {item.createdBy && <span>By {typeof item.createdBy === 'object' ? item.createdBy.fullName : item.createdBy}</span>}
                      </div>
                    </div>

                    {/* Admin action buttons */}
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[#101312]/15 bg-white px-2.5 py-1 text-xs text-[#101312]/80 transition hover:bg-[#101312]/5"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          item.isActive
                            ? 'border-[#101312]/15 bg-white text-[#101312]/80 hover:bg-[#101312]/[0.03]'
                            : 'border-[#16a34a]/30 bg-[#16a34a]/5 text-[#16a34a] hover:bg-[#101312]/5'
                        }`}
                        onClick={() => onToggle(itemId)}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs text-white transition hover:bg-violet-500"
                        onClick={() => setDeleteConfirm(itemId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}

        {/* Delete confirmation dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
            <div className="w-full max-w-sm rounded-2xl border border-[#101312]/10 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-semibold text-[#101312]">Delete Announcement</h3>
              <p className="mt-2 text-sm text-[#101312]/75">Are you sure you want to delete this announcement? This action cannot be undone.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-[#101312]/15 bg-white px-3 py-1.5 text-xs text-[#101312]/80 transition hover:bg-[#101312]/5"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-violet-500"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Student / Technician view (read-only, active only)
  return (
    <div className="space-y-4">
      {visibleAnnouncements.length === 0 && (
        <p className="py-8 text-center text-sm text-[#101312]/75">No announcements at this time.</p>
      )}

      {visibleAnnouncements.map((item) => {
        const itemId = item._id || item.id
        const style = priorityStyles[item.priority] || priorityStyles.normal

        return (
          <article
            key={itemId}
            className={`rounded-2xl border border-[#101312]/10 border-l-4 ${style.border} ${style.bg} p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]`}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#101312]">{item.title}</h3>
              <AnnouncementPriorityBadge priority={item.priority} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#101312]/75">{item.content}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-[#101312]/75">
              <span>{formatDate(item.createdAt)}</span>
              {item.createdBy && <span>Posted by {typeof item.createdBy === 'object' ? item.createdBy.fullName : item.createdBy}</span>}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default Announcements
