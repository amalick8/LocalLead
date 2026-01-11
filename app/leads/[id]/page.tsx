import { LeadDetails } from "@/components/lead-details"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  // Mock data - in real app would fetch from backend
  const mockLead = {
    id: params.id,
    service: "Plumbing",
    city: "San Francisco, CA",
    timestamp: "2 hours ago",
    isLocked: true,
    description:
      "I need emergency pipe repair in my bathroom. The pipe under the sink is leaking badly and water is pooling on the floor. This needs to be fixed as soon as possible.",
    contact: "john.doe@email.com",
    phone: "(555) 123-4567",
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <LeadDetails lead={mockLead} />
      </main>
    </div>
  )
}
