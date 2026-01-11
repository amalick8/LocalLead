"use client"

import { Button } from "@/components/ui/button"

export function LandingHero() {
  const scrollToQuote = () => {
    document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToServices = () => {
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50 px-6 py-20 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Headline + CTA */}
          <div>
            <h1 className="text-balance text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-tight">
              Get Local Help, <span className="text-primary">Fast</span>
            </h1>

            <p className="mt-6 text-pretty text-xl leading-relaxed text-gray-700 sm:text-2xl">
              Connect with qualified pros in your area. From plumbing to painting, we've got you covered.
            </p>

            <p className="mt-3 text-sm text-slate-500">4.9 average rating from 2,500+ verified reviews</p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={scrollToQuote}
                className="h-14 px-10 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Get a Free Quote
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToServices}
                className="h-14 px-10 text-lg font-semibold border-2 border-gray-300 hover:border-primary hover:text-primary hover:bg-blue-50 bg-white transition-all"
              >
                Browse Services
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <span>Responses within 24 hours</span>
              <span className="text-slate-300">•</span>
              <span>Licensed & insured professionals</span>
              <span className="text-slate-300">•</span>
              <span>No commitment required</span>
            </div>
          </div>

          {/* Right: Visual element */}
          <div className="relative">
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/modern-home-interior-with-professional-tools-and-w.jpg"
                alt="Professional service workspace"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">4.9/5 Average</div>
                  <div className="text-sm text-gray-600">From 2,500+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
