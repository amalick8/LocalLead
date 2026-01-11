import { Search, MessageSquare, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Tell Us What You Need",
    description: "Fill out a quick form with your service requirements and location",
    color: "bg-blue-500",
  },
  {
    icon: MessageSquare,
    title: "Get Matched Instantly",
    description: "We connect you with qualified local pros who want your business",
    color: "bg-teal-500",
  },
  {
    icon: CheckCircle,
    title: "Choose Your Pro",
    description: "Review profiles, compare quotes, and hire with confidence",
    color: "bg-green-500",
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
              {/* Connector line - hidden on mobile */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-1 bg-gradient-to-r from-gray-300 to-transparent" />
              )}

              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-md border-2 border-gray-100">
                {/* Step number badge */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center text-lg shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${step.color} text-white mb-6 shadow-lg`}
                >
                  <step.icon className="h-10 w-10" />
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
