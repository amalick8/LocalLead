"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function LeadForm() {
  const [formData, setFormData] = useState({
    service: "",
    city: "",
    description: "",
    contact: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Frontend only - would connect to backend
  }

  return (
    <section className="px-6 py-20 lg:px-8 bg-gradient-to-b from-blue-50 to-white" id="quote-section">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white mb-4 shadow-lg">
            {/* Removed CheckCircle component */}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Your Free Quote</h2>
          <p className="text-xl text-gray-600">Tell us what you need, and we'll connect you with local pros</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="service" className="text-base font-semibold text-gray-900">
                  What service do you need?
                </Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData({ ...formData, service: value })}
                >
                  <SelectTrigger id="service" className="h-14 text-base border-2 border-gray-200 focus:border-primary">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="landscaping">Landscaping</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="roofing">Roofing</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="handyman">Handyman</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">Choose the type of service you're looking for</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-base font-semibold text-gray-900">
                  Where are you located?
                </Label>
                <Input
                  id="city"
                  placeholder="Enter your city or ZIP code"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-14 text-base border-2 border-gray-200 focus:border-primary"
                />
                <p className="text-sm text-gray-500">We'll find pros in your area</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                  Describe your project
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell us what you need help with..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px] resize-none text-base border-2 border-gray-200 focus:border-primary"
                />
                <p className="text-sm text-gray-500">The more details, the better we can match you</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-base font-semibold text-gray-900">
                  Your contact info
                </Label>
                <Input
                  id="contact"
                  placeholder="Phone number or email"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="h-14 text-base border-2 border-gray-200 focus:border-primary"
                />
                <p className="text-sm text-gray-500">How should pros reach you?</p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-16 w-full text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Get Free Quotes Now
              </Button>

              <p className="text-center text-sm text-gray-500">
                No commitment required • Get responses within 24 hours
              </p>
            </form>
          </div>

          <div className="bg-slate-50 px-8 py-6 border-t-2 border-gray-100">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <span className="font-medium">100% Free</span>
              <span className="text-slate-300">•</span>
              <span className="font-medium">No Spam</span>
              <span className="text-slate-300">•</span>
              <span className="font-medium">Verified Pros</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
