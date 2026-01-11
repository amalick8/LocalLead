import { FileText, Users, CheckCircle2 } from "lucide-react"

const steps = [
  {
    icon: FileText,
    title: "Submit your request",
    description: "Tell us what you need and where you're located. It takes less than a minute.",
  },
  {
    icon: Users,
    title: "Get matched",
    description: "We connect you with qualified local professionals in your area.",
  },
  {
    icon: CheckCircle2,
    title: "Choose your pro",
    description: "Review profiles, compare quotes, and hire the professional that fits best.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-16 lg:px-8 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">How it works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Simple, straightforward, and designed to save you time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 text-slate-700 mb-6">
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
