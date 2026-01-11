import { Star, Award, Users, ThumbsUp } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Homeowners served",
    color: "text-blue-600",
  },
  {
    icon: Award,
    value: "10,000+",
    label: "Verified professionals",
    color: "text-slate-600",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Average rating",
    color: "text-slate-600",
  },
  {
    icon: ThumbsUp,
    value: "98%",
    label: "Satisfaction rate",
    color: "text-slate-600",
  },
]

export function TrustIndicators() {
  return (
    <section className="bg-white px-6 py-16 lg:px-8 border-t border-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 ${stat.color} mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-semibold text-slate-900 mb-1.5">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
