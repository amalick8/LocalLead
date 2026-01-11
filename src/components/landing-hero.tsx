import { LeadForm } from "@/components/LeadForm"

export function LandingHero() {
  return (
    <section className="pt-32 pb-16 px-6 lg:px-8 bg-slate-50">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Headline + Description */}
          <div className="pt-4 lg:pt-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-tight mb-6">
              Find trusted local professionals — without the stress.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-xl">
              Tell us what you need. We'll connect you with vetted pros in your area, fast.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span>Licensed professionals</span>
              <span className="text-slate-300">•</span>
              <span>Responses within 24 hours</span>
              <span className="text-slate-300">•</span>
              <span>No commitment required</span>
            </div>
          </div>

          {/* Right: Form Card */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">Get started</h2>
                <p className="text-sm sm:text-base text-slate-600">Tell us about your project and we'll match you with local professionals.</p>
              </div>
              <LeadForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
