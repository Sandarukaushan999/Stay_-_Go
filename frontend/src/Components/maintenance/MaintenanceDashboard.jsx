// MaintenanceDashboard - Main entry point for the maintenance module
// Orchestrates all sub-components, manages state, handles API calls
// Falls back to mock data when the backend is unreachable

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../app/store/authStore'

import SubmitComplaint from './SubmitComplaint'
import MyTickets from './MyTickets'
import TicketDetail from './TicketDetail'
import TechnicianTasks from './TechnicianTasks'
import AdminTickets from './AdminTickets'
import MaintenanceAnalytics from './MaintenanceAnalytics'
import Announcements from './Announcements'
import DownloadReports from './DownloadReports'

import * as maintenanceApi from './api'
import { mockTickets, mockAnnouncements, mockTechnicians } from './mockData'

// ============================================
// TAB CONFIGURATION PER ROLE
// ============================================
const tabsByRole = {
  student: [
    { key: 'submit', label: 'Submit Complaint' },
    { key: 'myTickets', label: 'My Tickets' },
    { key: 'announcements', label: 'Announcements' },
  ],
  technician: [
    { key: 'myTasks', label: 'My Tasks' },
    { key: 'announcements', label: 'Announcements' },
  ],
  admin: [
    { key: 'allTickets', label: 'All Tickets' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'announcements', label: 'Announcements' },
    { key: 'reports', label: 'Reports' },
  ],
  super_admin: [
    { key: 'allTickets', label: 'All Tickets' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'announcements', label: 'Announcements' },
    { key: 'reports', label: 'Reports' },
  ],
}

function MaintenanceDashboard() {
  const user = useAuthStore((state) => state.user)

  // Determine role (fallback to student if somehow null)
  const role = user?.role || 'student'
  const tabs = tabsByRole[role] || tabsByRole.student

  // ============================================
  // STATE
  // ============================================
  const [activeScreen, setActiveScreen] = useState(tabs[0]?.key || 'submit')
  const [tickets, setTickets] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // ============================================
  // DATA LOADING
  // ============================================
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (role === 'student') {
        const [ticketData, announcementData] = await Promise.all([
          maintenanceApi.getMyTickets(),
          maintenanceApi.getActiveAnnouncements(),
        ])
        setTickets(ticketData)
        setAnnouncements(announcementData)
      } else if (role === 'technician') {
        const [ticketData, announcementData] = await Promise.all([
          maintenanceApi.getAssignedTickets(),
          maintenanceApi.getActiveAnnouncements(),
        ])
        setTickets(ticketData)
        setAnnouncements(announcementData)
      } else {
        // admin or super_admin
        const [ticketData, announcementData, techData] = await Promise.all([
          maintenanceApi.getAllTickets(),
          maintenanceApi.getAllAnnouncements(),
          maintenanceApi.getTechnicians(),
        ])
        setTickets(ticketData)
        setAnnouncements(announcementData)
        setTechnicians(techData)
      }
    } catch (err) {
      console.warn('API call failed, falling back to mock data:', err.message)
      setError('Could not reach the server. Showing demo data.')
      setTickets(mockTickets)
      setAnnouncements(mockAnnouncements)
      setTechnicians(mockTechnicians)
    } finally {
      setIsLoading(false)
    }
  }, [role])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ============================================
  // QUICK STATS (derived from tickets)
  // ============================================
  const totalTickets = tickets.length
  const openTickets = tickets.filter(
    (t) => t.status !== 'closed' && t.status !== 'rejected'
  ).length
  const resolvedTickets = tickets.filter(
    (t) => t.status === 'resolved' || t.status === 'closed'
  ).length
  const ratedTickets = tickets.filter((t) => t.rating != null)
  const avgRating =
    ratedTickets.length > 0
      ? (ratedTickets.reduce((sum, t) => sum + t.rating, 0) / ratedTickets.length).toFixed(1)
      : '—'

  // ============================================
  // CRUD CALLBACKS
  // ============================================
  async function handleSubmitTicket(formData) {
    try {
      await maintenanceApi.createTicket(formData)
      await loadData()
      setActiveScreen('myTickets')
    } catch (err) {
      setError('Failed to submit ticket. Please try again.')
    }
  }

  async function handleAssignTicket(ticketId, technicianId) {
    try {
      await maintenanceApi.assignTicket(ticketId, technicianId)
      await loadData()
      setSelectedTicket(null)
    } catch (err) {
      setError('Failed to assign ticket.')
    }
  }

  async function handleRejectTicket(ticketId, reason) {
    try {
      await maintenanceApi.rejectTicket(ticketId, reason)
      await loadData()
      setSelectedTicket(null)
    } catch (err) {
      setError('Failed to reject ticket.')
    }
  }

  async function handleStartTicket(ticketId) {
    try {
      await maintenanceApi.startTicket(ticketId)
      await loadData()
    } catch (err) {
      setError('Failed to start ticket.')
    }
  }

  async function handleResolveTicket(ticketId, resolutionNote) {
    try {
      await maintenanceApi.resolveTicket(ticketId, resolutionNote)
      await loadData()
    } catch (err) {
      setError('Failed to resolve ticket.')
    }
  }

  async function handleRateTicket(ticketId, rating, feedback) {
    try {
      await maintenanceApi.rateTicket(ticketId, rating, feedback)
      await loadData()
      setSelectedTicket(null)
    } catch (err) {
      setError('Failed to rate ticket.')
    }
  }

  async function handleCreateAnnouncement(data) {
    try {
      await maintenanceApi.createAnnouncement(data)
      await loadData()
    } catch (err) {
      setError('Failed to create announcement.')
    }
  }

  async function handleUpdateAnnouncement(id, data) {
    try {
      await maintenanceApi.updateAnnouncement(id, data)
      await loadData()
    } catch (err) {
      setError('Failed to update announcement.')
    }
  }

  async function handleDeleteAnnouncement(id) {
    try {
      await maintenanceApi.deleteAnnouncement(id)
      await loadData()
    } catch (err) {
      setError('Failed to delete announcement.')
    }
  }

  async function handleToggleAnnouncement(id) {
    try {
      await maintenanceApi.toggleAnnouncement(id)
      await loadData()
    } catch (err) {
      setError('Failed to toggle announcement.')
    }
  }

  // ============================================
  // VIEW TICKET DETAIL
  // ============================================
  function handleSelectTicket(ticket) {
    setSelectedTicket(ticket)
  }

  function handleBackFromDetail() {
    setSelectedTicket(null)
  }

  // ============================================
  // RENDER ACTIVE SCREEN
  // ============================================
  function renderScreen() {
    // If a ticket is selected, show detail view regardless of active screen
    if (selectedTicket) {
      return (
        <TicketDetail
          ticket={selectedTicket}
          userRole={role}
          technicians={technicians}
          onBack={handleBackFromDetail}
          onAssign={handleAssignTicket}
          onReject={handleRejectTicket}
          onStart={handleStartTicket}
          onResolve={handleResolveTicket}
          onRate={handleRateTicket}
        />
      )
    }

    switch (activeScreen) {
      case 'submit':
        return <SubmitComplaint onSubmit={handleSubmitTicket} />

      case 'myTickets':
        return <MyTickets tickets={tickets} onSelectTicket={handleSelectTicket} />

      case 'myTasks':
        return (
          <TechnicianTasks
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            onStart={handleStartTicket}
            onResolve={handleResolveTicket}
          />
        )

      case 'allTickets':
        return (
          <AdminTickets
            tickets={tickets}
            technicians={technicians}
            onSelectTicket={handleSelectTicket}
            onAssign={handleAssignTicket}
            onReject={handleRejectTicket}
          />
        )

      case 'analytics':
        return <MaintenanceAnalytics tickets={tickets} />

      case 'announcements':
        return (
          <Announcements
            announcements={announcements}
            userRole={role}
            onCreate={handleCreateAnnouncement}
            onUpdate={handleUpdateAnnouncement}
            onDelete={handleDeleteAnnouncement}
            onToggle={handleToggleAnnouncement}
          />
        )

      case 'reports':
        return <DownloadReports tickets={tickets} />

      default:
        return <p className="text-slate-500">Select a tab to get started.</p>
    }
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="mx-auto max-w-6xl text-slate-900">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-3 text-emerald-700 hover:text-emerald-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Maintenance Workspace</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage hostel maintenance requests and track resolutions
              </p>
            </div>
            {user && (
              <div className="text-right text-sm">
                <p className="font-medium text-slate-900">{user.fullName}</p>
                <p className="text-xs capitalize text-slate-500">{role.replace('_', ' ')}</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-lg font-bold text-emerald-600">{totalTickets}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Open</p>
              <p className="text-lg font-bold text-violet-600">{openTickets}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Resolved</p>
              <p className="text-lg font-bold text-emerald-600">{resolvedTickets}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Avg Rating</p>
              <p className="text-lg font-bold text-emerald-600">
                {avgRating === '—' ? '—' : `${avgRating}/5`}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white/80 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveScreen(tab.key)
                setSelectedTicket(null)
              }}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeScreen === tab.key
                  ? 'bg-[#BAF91A] text-[#101312] shadow-sm'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
            <span className="ml-3 text-sm text-slate-500">Loading maintenance data...</span>
          </div>
        ) : (
          /* Active Screen Content */
          renderScreen()
        )}
    </div>
  )
}

export default MaintenanceDashboard
