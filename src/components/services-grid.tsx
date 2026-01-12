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

const serviceIconColors: Record<string, string> = {
  "Plumbing": "bg-blue-50 text-blue-600",
  "Electrical": "bg-amber-50 text-amber-600",
  "Painting": "bg-purple-50 text-purple-600",
  "HVAC": "bg-cyan-50 text-cyan-600",
  "Roofing": "bg-red-50 text-red-600",
  "Landscaping": "bg-green-50 text-green-600",
  "Cleaning": "bg-pink-50 text-pink-600",
  "Handyman": "bg-orange-50 text-orange-600",
  "Car Detailing": "bg-indigo-50 text-indigo-600",
  "Home Cleaning": "bg-pink-50 text-pink-600",
  "Moving Services": "bg-amber-50 text-amber-600",
  "Tutoring": "bg-violet-50 text-violet-600",
  "Hair Styling": "bg-rose-50 text-rose-600",
  "Catering": "bg-emerald-50 text-emerald-600",
  "Personal Training": "bg-sky-50 text-sky-600",
  "Music Lessons": "bg-fuchsia-50 text-fuchsia-600",
  "Childcare": "bg-amber-50 text-amber-600",
  "Pet Care": "bg-lime-50 text-lime-600",
  "Elder Care": "bg-red-50 text-red-600",
  "Business Services": "bg-slate-50 text-slate-600",
  "Education": "bg-blue-50 text-blue-600",
}

export function ServicesGrid() {
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const { data: services, isLoading } = useServices()

  const handleServiceClick = (label: string) => {
    setExpandedService(expandedService === label ? null : label)
  }

  const scrollToForm = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section id="services-section" className="px-6 py-16 lg:px-8 bg-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">Services we cover</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From home repairs to personal services, we connect you with qualified professionals.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-200 mb-4"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : !services || services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No services available at this time.</p>
            <p className="text-sm text-slate-500">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {services.map((service) => {
            const Icon = serviceIcons[service.name] || Hammer
            const iconColor = serviceIconColors[service.name] || "bg-slate-50 text-slate-600"
            
            return (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service.name)}
                className="group bg-white rounded-xl p-6 text-left border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${iconColor} mb-4 transition-transform group-hover:scale-105`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">{service.name}</h3>
                
                {expandedService === service.name && (
                  <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      {service.description || `Professional ${service.name.toLowerCase()} services`}
                    </p>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        scrollToForm()
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                    >
                      Request a quote
                    </Button>
                  </div>
                )}
              </button>
            )
          })}
          </div>
        )}
      </div>
    </section>
  )
}
