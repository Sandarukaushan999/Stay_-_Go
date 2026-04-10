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
      const result = await maintenanceApi.createTicket(formData)
      await loadData()
      // Return the ticket data so SubmitComplaint can show the success screen with ticketId
      return result
    } catch (err) {
      setError('Failed to submit ticket. Please try again.')
      throw err
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
    <div className="-mx-4 -mt-5 min-h-screen bg-[#fafafa] px-4 pb-10 pt-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div className="mx-auto max-w-6xl text-[#101312]">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 rounded-xl border border-[#e53e3e]/20 bg-[#e53e3e]/5 px-4 py-3 text-sm text-[#e53e3e]">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-3 hover:opacity-70">Dismiss</button>
          </div>
        </div>
      )}

      {/* Page Header — compact bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#101312]">Maintenance</h1>
          <p className="mt-1 text-sm text-[#101312]/75">
            Track and manage hostel maintenance requests
          </p>
        </div>
        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-xl font-bold text-[#101312]">{totalTickets}</p>
            <p className="text-[10px] uppercase tracking-wide text-[#101312]/75">Total</p>
          </div>
          <div className="h-8 w-px bg-[#101312]/10" />
          <div className="text-center">
            <p className="text-xl font-bold text-[#876DFF]">{openTickets}</p>
            <p className="text-[10px] uppercase tracking-wide text-[#101312]/75">Open</p>
          </div>
          <div className="h-8 w-px bg-[#101312]/10" />
          <div className="text-center">
            <p className="text-xl font-bold text-[#16a34a]">{resolvedTickets}</p>
            <p className="text-[10px] uppercase tracking-wide text-[#101312]/75">Resolved</p>
          </div>
          <div className="h-8 w-px bg-[#101312]/10" />
          <div className="text-center">
            <p className="text-xl font-bold text-[#101312]">{avgRating === '—' ? '—' : avgRating}</p>
            <p className="text-[10px] uppercase tracking-wide text-[#101312]/75">Rating</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation — clean tab bar */}
      <div className="mb-6 border-b border-[#101312]/10">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveScreen(tab.key)
                setSelectedTicket(null)
              }}
              className={`relative px-4 py-2.5 text-sm font-medium transition ${
                activeScreen === tab.key
                  ? 'text-[#101312]'
                  : 'text-[#101312]/80 hover:text-[#101312]/80'
              }`}
            >
              {tab.label}
              {/* Active indicator line */}
              {activeScreen === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#BAF91A]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#101312]/10 border-t-[#BAF91A]" />
          <span className="ml-3 text-sm text-[#101312]/75">Loading...</span>
        </div>
      ) : (
        renderScreen()
      )}
    </div>
    </div>
  )
}

export default MaintenanceDashboard
