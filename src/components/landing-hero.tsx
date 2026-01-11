import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function LandingHero() {
  const scrollToQuote = () => {
    document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToServices = () => {
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 px-6 py-20 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Headline + CTA */}
          <div>
            <h1 className="text-balance text-5xl font-bold tracking-tight text-slate-800 sm:text-6xl lg:text-7xl leading-tight">
              Get Local Help, <span className="text-primary">Fast</span>
            </h1>

            <p className="mt-6 text-pretty text-xl leading-relaxed text-slate-600 sm:text-2xl">
              Connect with qualified pros in your area. From plumbing to painting, we've got you covered.
            </p>

            <p className="mt-3 text-sm text-slate-600">4.9 average rating from 2,500+ verified reviews</p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={scrollToQuote}
                className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 hover:from-blue-700 hover:via-blue-800 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all"
              >
                Get a Free Quote
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToServices}
                className="h-14 px-10 text-lg font-semibold border-2 border-blue-600 text-blue-700 hover:bg-blue-50 hover:border-blue-700 bg-white transition-all"
              >
                Browse Services
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <span>Responses within 24 hours</span>
              <span className="text-slate-400">•</span>
              <span>Licensed & insured professionals</span>
              <span className="text-slate-400">•</span>
              <span>No commitment required</span>
            </div>
          </div>

          {/* Right: Visual element */}
          <div className="relative">
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/happy-homeowner-shaking-hands-with-professional-co.jpg"
                alt="Homeowner connecting with professional"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
