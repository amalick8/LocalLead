import { Header } from '@/components/Header';
import { LandingHero } from '@/components/landing-hero';
import { ServicesGrid } from '@/components/services-grid';
import { HowItWorks } from '@/components/how-it-works';
import { LeadForm } from '@/components/LeadForm';
import { TrustIndicators } from '@/components/trust-indicators';
import { CtaSection } from '@/components/cta-section';
import { Footer } from '@/components/footer';

export default function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <LandingHero />
      <ServicesGrid />
      <HowItWorks />
      
      {/* Quote Section with Lead Form */}
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-b from-blue-50 to-white" id="quote-section">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Your Free Quote</h2>
            <p className="text-xl text-gray-600">Tell us what you need, and we'll connect you with local pros</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden">
            <div className="p-8 sm:p-10">
              <LeadForm />
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

      <TrustIndicators />
      <CtaSection />
      <Footer />
    </div>
  );
}
