import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export function CtaSection() {
  const navigate = useNavigate()
  
  const scrollToQuote = () => {
    document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center relative z-10">
        <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of satisfied homeowners who found their perfect pro through Local Leads Hub
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={scrollToQuote}
            className="h-16 px-12 text-lg font-bold bg-white text-blue-700 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all"
          >
            Get Your Free Quote
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Link to="/signup">
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-12 text-lg font-bold bg-transparent text-white border-2 border-white hover:bg-white/10"
            >
              For Businesses
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-blue-100 text-sm">
          No credit card required • Get responses in 24 hours • Cancel anytime
        </p>
      </div>
    </section>
  )
}
