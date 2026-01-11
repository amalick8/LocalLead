import { LandingHero } from "@/components/landing-hero"
import { ServicesGrid } from "@/components/services-grid"
import { HowItWorks } from "@/components/how-it-works"
import { LeadForm } from "@/components/lead-form"
import { TrustIndicators } from "@/components/trust-indicators"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHero />
      <ServicesGrid />
      <HowItWorks />
      <LeadForm />
      <TrustIndicators />
      <CtaSection />
      <Footer />
    </div>
  )
}
