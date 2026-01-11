import { LeadCard } from "@/components/lead-card"
import { Inbox } from "lucide-react"

interface Lead {
  id: string
  service: string
  city: string
  timestamp: string
  isLocked: boolean
  description: string
  contact?: string
  phone?: string
}

interface LeadsListProps {
  leads: Lead[]
}

export function LeadsList({ leads }: LeadsListProps) {
  if (leads.length === 0) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 mb-6">
            <Inbox className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No leads yet</h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            New customer requests will appear here. Check back soon!
          </p>
        </div>
      </div>
    )
  }

  const unlockedCount = leads.filter((lead) => !lead.isLocked).length
  const lockedCount = leads.filter((lead) => lead.isLocked).length

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-8 border-2 border-blue-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Leads</h2>
        <div className="flex flex-wrap gap-4 text-base">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            <span className="font-semibold text-gray-700">{unlockedCount} Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
            <span className="font-semibold text-gray-700">{lockedCount} Locked</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            service={lead.service}
            city={lead.city}
            timestamp={lead.timestamp}
            isLocked={lead.isLocked}
            description={lead.description}
            contact={lead.contact}
            phone={lead.phone}
          />
        ))}
      </div>
    </div>
  )
}
