import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container-narrow">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">About LocalLead</h1>
            
            <div className="space-y-12">
              {/* Mission */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Mission</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  LocalLead helps homeowners connect with independent local professionals in a fast, simple, and transparent way. 
                  We provide a neutral platform where service requests meet qualified service providers.
                </p>
              </section>

              {/* What We Are */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">What We Are</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">A Neutral Marketplace</h3>
                    <p className="text-slate-600">
                      LocalLead operates as a platform connecting homeowners with local service professionals. 
                      We facilitate introductions and provide tools for communication, but we do not perform services ourselves.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Independent Service Providers</h3>
                    <p className="text-slate-600">
                      All service providers on LocalLead are independent businesses. We do not employ service providers, 
                      and we do not control their work quality, pricing, or business practices.
                    </p>
                  </div>
                </div>
              </section>

              {/* What We Are Not */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">What We Are Not</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Not a Contractor</h3>
                    <p className="text-slate-600">
                      LocalLead does not perform any home services, repairs, or installations. We are a technology platform only.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Not a Service Provider</h3>
                    <p className="text-slate-600">
                      We do not directly provide plumbing, electrical, cleaning, or any other home services. 
                      All services are performed by independent professionals.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Not Responsible for Job Outcomes</h3>
                    <p className="text-slate-600">
                      LocalLead is not responsible for the quality, safety, timeliness, or outcome of services provided by 
                      independent professionals. All agreements and work are between homeowners and service providers directly.
                    </p>
                  </div>
                </div>
              </section>

              {/* How We Operate */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">How We Operate</h2>
                <p className="text-slate-600 leading-relaxed">
                  Homeowners submit service requests through our platform. Service providers in the relevant area can view 
                  these requests and choose to respond. LocalLead facilitates this connection but does not guarantee matches, 
                  response times, or service quality. All interactions and agreements are between homeowners and service providers.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
