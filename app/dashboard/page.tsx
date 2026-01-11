import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LeadsList } from "@/components/dashboard/leads-list"

export default function DashboardPage() {
  // Mock data - in real app would come from backend
  const mockLeads = [
    {
      id: "1",
      service: "Plumbing",
      city: "San Francisco, CA",
      timestamp: "2 hours ago",
      isLocked: true,
      description: "Need emergency pipe repair in bathroom",
    },
    {
      id: "2",
      service: "Electrical",
      city: "Oakland, CA",
      timestamp: "5 hours ago",
      isLocked: false,
      description: "Installing new outlets in home office",
      contact: "john.doe@email.com",
      phone: "(555) 123-4567",
    },
    {
      id: "3",
      service: "Landscaping",
      city: "Berkeley, CA",
      timestamp: "1 day ago",
      isLocked: true,
      description: "Yard maintenance and tree trimming needed",
    },
    {
      id: "4",
      service: "HVAC",
      city: "San Jose, CA",
      timestamp: "2 days ago",
      isLocked: false,
      description: "AC unit not cooling properly",
      contact: "sarah.smith@email.com",
      phone: "(555) 987-6543",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <LeadsList leads={mockLeads} />
      </main>
    </div>
  )
}
