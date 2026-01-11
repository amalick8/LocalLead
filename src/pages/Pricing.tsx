import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container-narrow">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">Pricing</h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
              Simple, transparent pricing. Pay only when you choose to access a customer request.
            </p>

            <div className="space-y-12">
              {/* Pricing Model */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">How Pricing Works</h2>
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">Per-Lead Access</h3>
                      <p className="text-slate-600 mb-4">
                        When a homeowner submits a service request in your area, you'll receive a notification. 
                        You can review the request details and choose whether to access the full contact information.
                      </p>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-sm text-slate-600">
                          <strong className="text-slate-800">Example pricing:</strong> Access to a qualified lead typically ranges from $5 to $25 per request, 
                          depending on service category and location. Actual pricing is displayed before you commit to accessing a lead.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-600"><strong className="text-slate-800">Charges apply only</strong> when you choose to access a customer request</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-600"><strong className="text-slate-800">No hidden fees</strong> - you see the cost before accessing any lead</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-600"><strong className="text-slate-800">No subscription lock-in</strong> - access leads on your schedule</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Required Legal Copy */}
              <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Pricing Terms</h2>
                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  <p>
                    <strong className="text-slate-800">Prices are subject to change.</strong> We reserve the right to adjust pricing 
                    based on market conditions, service category, and other factors.
                  </p>
                  <p>
                    <strong className="text-slate-800">Charges apply only when a business chooses to access a customer request.</strong> 
                    You are not charged for receiving notifications or viewing request summaries.
                  </p>
                  <p>
                    Payment is processed securely through our payment provider. All transactions are final once a lead is accessed.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
