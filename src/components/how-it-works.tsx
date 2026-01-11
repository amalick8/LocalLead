import { Search, MessageSquare, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Tell Us What You Need",
    description: "Fill out a quick form with your service requirements and location",
    gradient: "from-blue-600 to-blue-700",
  },
  {
    icon: MessageSquare,
    title: "Get Matched Instantly",
    description: "We connect you with qualified local pros who want your business",
    gradient: "from-blue-700 to-teal-600",
  },
  {
    icon: CheckCircle,
    title: "Choose Your Pro",
    description: "Review profiles, compare quotes, and hire with confidence",
    gradient: "from-teal-600 to-teal-700",
  },
]

export function HowItWorks() {
  return (
    <section className="px-6 py-20 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to finding the perfect professional
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-md border border-gray-200">
                {/* Icon with gradient matching CTA section */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${step.gradient} text-white mb-6 shadow-lg`}
                >
                  <step.icon className="h-8 w-8" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
