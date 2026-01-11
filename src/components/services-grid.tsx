import { 
  Wrench, 
  Zap, 
  Paintbrush, 
  Wind, 
  Home, 
  Leaf, 
  Sparkles, 
  Hammer,
  Car,
  Package,
  Pen,
  Droplet,
  Scissors,
  Utensils,
  Dumbbell,
  Music,
  Baby,
  Dog,
  Heart,
  Briefcase,
  GraduationCap
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useServices } from "@/hooks/useServices"

const serviceIcons: Record<string, any> = {
  "Plumbing": Droplet,
  "Electrical": Zap,
  "Painting": Paintbrush,
  "HVAC": Wind,
  "Roofing": Home,
  "Landscaping": Leaf,
  "Cleaning": Sparkles,
  "Handyman": Hammer,
  "Car Detailing": Car,
  "Home Cleaning": Sparkles,
  "Moving Services": Package,
  "Tutoring": Pen,
  "Hair Styling": Scissors,
  "Catering": Utensils,
  "Personal Training": Dumbbell,
  "Music Lessons": Music,
  "Childcare": Baby,
  "Pet Care": Dog,
  "Elder Care": Heart,
  "Business Services": Briefcase,
  "Education": GraduationCap,
}


export function ServicesGrid() {
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const { data: services, isLoading } = useServices()

  const handleServiceClick = (label: string) => {
    setExpandedService(expandedService === label ? null : label)
  }

  const scrollToQuote = () => {
    document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" })
  }

  if (isLoading) {
    return (
      <section id="services-section" className="px-6 py-20 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">Services We Cover</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Loading services...
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="services-section" className="px-6 py-20 lg:px-8 bg-gradient-to-b from-white to-blue-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">Services We Cover</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whatever you need, we connect you with the right professionals
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {services?.map((service) => {
            const Icon = serviceIcons[service.name] || Hammer
            const serviceDescriptions: Record<string, string> = {
              "Plumbing": "Licensed plumbers for repairs, installations, and maintenance",
              "Electrical": "Certified electricians for repairs, installs, and upgrades",
              "Painting": "Professional interior and exterior painting services",
              "HVAC": "Heating and cooling repair, maintenance, and installation",
              "Roofing": "Professional roofing services from repairs to replacements",
              "Landscaping": "Lawn care, design, and outdoor maintenance services",
              "Cleaning": "Residential and commercial cleaning services",
              "Handyman": "General repairs and home improvement projects",
              "Car Detailing": "Professional car washing, waxing, and interior cleaning",
              "Home Cleaning": "Thorough home cleaning and housekeeping services",
              "Moving Services": "Professional moving and relocation assistance",
              "Tutoring": "Personalized tutoring and educational support",
              "Hair Styling": "Professional haircuts, styling, and salon services",
              "Catering": "Event catering and food service professionals",
              "Personal Training": "Fitness coaching and personal training",
              "Music Lessons": "Music instruction and lessons",
              "Childcare": "Professional childcare and babysitting services",
              "Pet Care": "Pet sitting, walking, and grooming services",
              "Elder Care": "Compassionate elder care and assistance",
              "Business Services": "Professional business and consulting services",
              "Education": "Educational services and tutoring",
            }
            
            const serviceIconColors: Record<string, string> = {
              "Plumbing": "bg-blue-100 text-blue-600",
              "Electrical": "bg-yellow-100 text-yellow-600",
              "Painting": "bg-purple-100 text-purple-600",
              "HVAC": "bg-cyan-100 text-cyan-600",
              "Roofing": "bg-red-100 text-red-600",
              "Landscaping": "bg-green-100 text-green-600",
              "Cleaning": "bg-pink-100 text-pink-600",
              "Handyman": "bg-orange-100 text-orange-600",
              "Car Detailing": "bg-indigo-100 text-indigo-600",
              "Home Cleaning": "bg-pink-100 text-pink-600",
              "Moving Services": "bg-amber-100 text-amber-600",
              "Tutoring": "bg-violet-100 text-violet-600",
              "Hair Styling": "bg-rose-100 text-rose-600",
              "Catering": "bg-emerald-100 text-emerald-600",
              "Personal Training": "bg-sky-100 text-sky-600",
              "Music Lessons": "bg-fuchsia-100 text-fuchsia-600",
              "Childcare": "bg-amber-100 text-amber-600",
              "Pet Care": "bg-lime-100 text-lime-600",
              "Elder Care": "bg-red-100 text-red-600",
              "Business Services": "bg-slate-100 text-slate-600",
              "Education": "bg-blue-100 text-blue-600",
            }
            const iconColor = serviceIconColors[service.name] || "bg-slate-100 text-slate-600"
            
            return (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service.name)}
                className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-slate-200 hover:border-blue-600"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${iconColor} mb-4 transition-transform group-hover:scale-110`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>

                {expandedService === service.name && (
                  <div className="mt-3 pt-3 border-t border-slate-200 animate-in fade-in duration-300">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {service.description || serviceDescriptions[service.name] || `Professional ${service.name.toLowerCase()} services`}
                    </p>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        scrollToQuote()
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 hover:from-blue-700 hover:via-blue-800 hover:to-teal-700 text-white"
                    >
                      Request a quote
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
