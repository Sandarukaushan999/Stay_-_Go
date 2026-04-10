// ============================================
// MOCK DATA for Maintenance Module
// Used as fallback when backend is offline
// ============================================

export const mockUsers = {
  student: { id: 'student1', fullName: 'Kasun Perera', email: 'kasun@university.edu', role: 'student' },
  technician1: { id: 'tech1', fullName: 'Nimal Silva', email: 'nimal@university.edu', role: 'technician' },
  technician2: { id: 'tech2', fullName: 'Ruwan Fernando', email: 'ruwan@university.edu', role: 'technician' },
  technician3: { id: 'tech3', fullName: 'Chaminda Jayasinghe', email: 'chaminda@university.edu', role: 'technician' },
  admin: { id: 'admin1', fullName: 'Sarah M.D.', email: 'sarah@university.edu', role: 'admin' },
}

export const mockTechnicians = [
  mockUsers.technician1, mockUsers.technician2, mockUsers.technician3,
]

export const mockTickets = [
  {
    _id: '1', ticketId: 'MT-20260320-001', title: 'Broken tap in bathroom',
    category: 'plumbing', priority: 'high', hostelBlock: 'A', roomNumber: '204',
    description: 'The hot water tap in the shared bathroom on the second floor is leaking badly. Water is dripping continuously and the floor is getting wet which is dangerous.',
    attachments: [], status: 'submitted', submittedBy: mockUsers.student, assignedTo: null,
    rejectionReason: null, resolutionNote: null, rating: null, ratingFeedback: null,
    statusHistory: [{ status: 'submitted', changedBy: mockUsers.student, changedAt: '2026-03-20T08:30:00', note: 'Ticket submitted by student' }],
    createdAt: '2026-03-20T08:30:00',
  },
  {
    _id: '2', ticketId: 'MT-20260319-003', title: 'Power socket not working in room',
    category: 'electrical', priority: 'medium', hostelBlock: 'B', roomNumber: '312',
    description: 'The power socket near the study desk stopped working since yesterday.',
    attachments: [], status: 'assigned', submittedBy: mockUsers.student, assignedTo: mockUsers.technician1,
    rejectionReason: null, resolutionNote: null, rating: null, ratingFeedback: null,
    statusHistory: [
      { status: 'submitted', changedBy: mockUsers.student, changedAt: '2026-03-19T14:20:00', note: 'Ticket submitted by student' },
      { status: 'assigned', changedBy: mockUsers.admin, changedAt: '2026-03-19T16:45:00', note: 'Technician assigned by admin' },
    ],
    createdAt: '2026-03-19T14:20:00',
  },
  {
    _id: '3', ticketId: 'MT-20260318-002', title: 'WiFi connection dropping frequently',
    category: 'network', priority: 'high', hostelBlock: 'A', roomNumber: '105',
    description: 'The WiFi keeps disconnecting every few minutes in my room.',
    attachments: [], status: 'in_progress', submittedBy: mockUsers.student, assignedTo: mockUsers.technician2,
    rejectionReason: null, resolutionNote: null, rating: null, ratingFeedback: null,
    statusHistory: [
      { status: 'submitted', changedBy: mockUsers.student, changedAt: '2026-03-18T09:10:00', note: 'Ticket submitted by student' },
      { status: 'assigned', changedBy: mockUsers.admin, changedAt: '2026-03-18T10:30:00', note: 'Technician assigned by admin' },
      { status: 'in_progress', changedBy: mockUsers.technician2, changedAt: '2026-03-18T13:00:00', note: 'Technician started working on the issue' },
    ],
    createdAt: '2026-03-18T09:10:00',
  },
  {
    _id: '4', ticketId: 'MT-20260317-001', title: 'Broken chair in study room',
    category: 'furniture', priority: 'low', hostelBlock: 'C', roomNumber: '401',
    description: 'One of the chairs in the common study room has a broken leg and is unstable.',
    attachments: [], status: 'resolved', submittedBy: mockUsers.student, assignedTo: mockUsers.technician3,
    rejectionReason: null, resolutionNote: 'Replaced the broken chair leg with a new one.',
    rating: null, ratingFeedback: null,
    statusHistory: [
      { status: 'submitted', changedBy: mockUsers.student, changedAt: '2026-03-17T07:45:00', note: 'Ticket submitted by student' },
      { status: 'assigned', changedBy: mockUsers.admin, changedAt: '2026-03-17T09:00:00', note: 'Technician assigned by admin' },
      { status: 'in_progress', changedBy: mockUsers.technician3, changedAt: '2026-03-17T10:30:00', note: 'Started working' },
      { status: 'resolved', changedBy: mockUsers.technician3, changedAt: '2026-03-17T14:00:00', note: 'Replaced broken chair leg.' },
    ],
    createdAt: '2026-03-17T07:45:00',
  },
  {
    _id: '5', ticketId: 'MT-20260315-002', title: 'Ceiling fan making loud noise',
    category: 'electrical', priority: 'medium', hostelBlock: 'D', roomNumber: '208',
    description: 'The ceiling fan in my room is making a very loud rattling noise when turned on.',
    attachments: [], status: 'closed', submittedBy: mockUsers.student, assignedTo: mockUsers.technician1,
    rejectionReason: null, resolutionNote: 'Tightened the fan mounting screws and balanced the blades.',
    rating: 4, ratingFeedback: 'Good service, fixed quickly. Thank you!',
    statusHistory: [
      { status: 'submitted', changedBy: mockUsers.student, changedAt: '2026-03-15T11:20:00', note: 'Ticket submitted by student' },
      { status: 'assigned', changedBy: mockUsers.admin, changedAt: '2026-03-15T13:00:00', note: 'Technician assigned' },
      { status: 'in_progress', changedBy: mockUsers.technician1, changedAt: '2026-03-15T14:30:00', note: 'Started working' },
      { status: 'resolved', changedBy: mockUsers.technician1, changedAt: '2026-03-15T16:00:00', note: 'Tightened screws and balanced blades.' },
      { status: 'closed', changedBy: mockUsers.student, changedAt: '2026-03-16T08:00:00', note: 'Student rated 4/5: Good service!' },
    ],
    createdAt: '2026-03-15T11:20:00',
  },
]

export const mockAnnouncements = [
  {
    _id: 'a1', title: 'Scheduled water supply maintenance - Block A & B',
    content: 'Water supply will be temporarily cut off on Block A and Block B on 28th March from 8:00 AM to 12:00 PM.',
    priority: 'urgent', isActive: true, createdBy: mockUsers.admin, createdAt: '2026-03-25T09:00:00',
  },
  {
    _id: 'a2', title: 'New maintenance request process update',
    content: 'From now on all maintenance requests should be submitted through the STAY & GO platform only.',
    priority: 'important', isActive: true, createdBy: mockUsers.admin, createdAt: '2026-03-24T14:30:00',
  },
  {
    _id: 'a3', title: 'Monthly pest control schedule',
    content: 'Regular pest control treatment will be carried out in all hostel blocks during the first week of April.',
    priority: 'normal', isActive: true, createdBy: mockUsers.admin, createdAt: '2026-03-23T11:00:00',
  },
]
