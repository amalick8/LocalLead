import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function GetMoreLeads() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container-narrow">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">Get More Local Leads</h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
              Connect with homeowners actively seeking your services. LocalLead helps independent service professionals 
              receive qualified customer requests in their area.
            </p>

            <div className="space-y-12">
              {/* How It Works */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">How It Works</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Create Your Account</h3>
                      <p className="text-slate-600">Sign up and provide your business information, service categories, and service area.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Set Your Services</h3>
                      <p className="text-slate-600">Specify the services you offer and the geographic areas you serve.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Receive Requests</h3>
                      <p className="text-slate-600">Get notified when homeowners in your area submit service requests matching your services.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* What You Get */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">What You Get</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Qualified Local Service Requests</h3>
                      <p className="text-slate-600">Receive customer requests from homeowners in your service area who need your specific services.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Clear Job Details</h3>
                      <p className="text-slate-600">View project descriptions, location, and contact preferences before responding to requests.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">No Long-Term Contracts</h3>
                      <p className="text-slate-600">Access leads on a per-request basis. No monthly subscriptions or commitments required.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Important Disclaimer */}
              <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Important Disclaimer</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Lead volume and quality may vary based on location, service category, and demand. 
                  LocalLead does not guarantee a specific number of leads or conversions. 
                  Results depend on various factors including market conditions, service area coverage, and customer preferences.
                </p>
              </section>

              {/* CTA */}
              <div className="text-center pt-8">
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 hover:from-blue-700 hover:via-blue-800 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all"
                  >
                    Create a Business Account
                  </Button>
                </Link>
                <p className="text-sm text-slate-500 mt-4">No long-term commitment required</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
