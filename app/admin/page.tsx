import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function AdminPage() {
  const mockLeads = [
    { id: "1", service: "Plumbing", city: "San Francisco", status: "unlocked", business: "ABC Plumbing" },
    { id: "2", service: "Electrical", city: "Oakland", status: "locked", business: null },
    { id: "3", service: "Landscaping", city: "Berkeley", status: "unlocked", business: "Green Yard Co" },
  ]

  const mockBusinesses = [
    { id: "1", name: "ABC Plumbing", email: "abc@plumbing.com", unlockedLeads: 12, status: "active" },
    { id: "2", name: "Green Yard Co", email: "info@greenyard.com", unlockedLeads: 8, status: "active" },
    { id: "3", name: "Bright Electric", email: "hello@bright.com", unlockedLeads: 5, status: "inactive" },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <AdminDashboard leads={mockLeads} businesses={mockBusinesses} />
      </main>
    </div>
  )
}
