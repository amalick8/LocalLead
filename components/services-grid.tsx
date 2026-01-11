"use client"

import { Wrench, Zap, Paintbrush, Wind, Home, Leaf, Sparkles, Hammer } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: Wrench,
    label: "Plumbing",
    color: "bg-blue-100 text-blue-700",
    description: "From leaky faucets to full installations, our licensed plumbers handle it all.",
  },
  {
    icon: Zap,
    label: "Electrical",
    color: "bg-yellow-100 text-yellow-700",
    description: "Safe, certified electrical work for repairs, installations, and upgrades.",
  },
  {
    icon: Paintbrush,
    label: "Painting",
    color: "bg-purple-100 text-purple-700",
    description: "Interior and exterior painting services with quality finishes.",
  },
  {
    icon: Wind,
    label: "HVAC",
    color: "bg-cyan-100 text-cyan-700",
    description: "Heating and cooling repair, maintenance, and installation by experts.",
  },
  {
    icon: Home,
    label: "Roofing",
    color: "bg-red-100 text-red-700",
    description: "Professional roofing services from repairs to complete replacements.",
  },
  {
    icon: Leaf,
    label: "Landscaping",
    color: "bg-teal-100 text-teal-700",
    description: "Beautiful outdoor spaces with lawn care, design, and maintenance.",
  },
  {
    icon: Sparkles,
    label: "Cleaning",
    color: "bg-pink-100 text-pink-700",
    description: "Residential and commercial cleaning services you can trust.",
  },
  {
    icon: Hammer,
    label: "Handyman",
    color: "bg-orange-100 text-orange-700",
    description: "General repairs and home improvements for all your projects.",
  },
]

export function ServicesGrid() {
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const handleServiceClick = (label: string) => {
    setExpandedService(expandedService === label ? null : label)
  }

  const scrollToQuote = () => {
    document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" })
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
          {services.map((service) => (
            <div
              key={service.label}
              onClick={() => handleServiceClick(service.label)}
              className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-primary"
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${service.color} mb-4 group-hover:scale-110 transition-transform`}
              >
                <service.icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{service.label}</h3>

              {expandedService === service.label && (
                <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-slate-600 mb-4">{service.description}</p>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      scrollToQuote()
                    }}
                    className="w-full"
                  >
                    Get a quote
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
