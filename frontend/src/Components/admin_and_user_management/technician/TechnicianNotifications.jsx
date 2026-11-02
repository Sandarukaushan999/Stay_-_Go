import { Bell } from 'lucide-react'
import TechnicianLayout from '../layout/TechnicianLayout'
import NotificationsFeed from '../shared/NotificationsFeed'
import { PageHeader } from '../shared/ui'

export default function TechnicianNotifications() {
  return (
    <TechnicianLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader icon={Bell} title="Notifications" subtitle="New job assignments, verification results and hostel announcements." />
        <NotificationsFeed />
      </div>
    </TechnicianLayout>
  )
}
