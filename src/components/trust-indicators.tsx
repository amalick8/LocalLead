import { Star, Award, Users, ThumbsUp } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Happy Homeowners",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Award,
    value: "10,000+",
    label: "Verified Professionals",
    color: "bg-teal-100 text-teal-600",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Average Rating",
    color: "bg-slate-100 text-slate-600",
  },
  {
    icon: ThumbsUp,
    value: "98%",
    label: "Satisfaction Rate",
    color: "bg-slate-100 text-slate-600",
  },
]

export function TrustIndicators() {
  return (
    <section className="bg-white px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">Trusted by Thousands</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join the growing community of homeowners and businesses who trust Local Leads Hub
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-md border-2 border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${stat.color} mb-4`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-base font-medium text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
