import { Header } from '@/components/Header';
import { LeadForm } from '@/components/LeadForm';
import { CheckCircle2, Zap, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Fast Response',
    description: 'Get connected with local pros within hours, not days.',
  },
  {
    icon: Users,
    title: 'Verified Businesses',
    description: 'All our service providers are vetted and reviewed.',
  },
  {
    icon: Shield,
    title: 'Free for You',
    description: 'No cost to request quotes. Compare and choose freely.',
  },
];

const stats = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '500+', label: 'Local Businesses' },
  { value: '24hr', label: 'Avg. Response' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="gradient-hero pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left animate-fade-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                Find Trusted Local
                <span className="text-gradient block">Services Today</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/80 max-w-xl mx-auto lg:mx-0">
                Connect with verified local professionals for cleaning, moving, tutoring, and more. 
                Get free quotes in minutes.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-5 py-3 text-center"
                  >
                    <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
                    <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up stagger-2">
              <div className="bg-card rounded-2xl shadow-xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Get Free Quotes</h2>
                  <p className="text-muted-foreground mt-1">
                    Tell us what you need and we'll connect you with pros
                  </p>
                </div>
                <LeadForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Why Choose LocalLead?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We make it easy to find reliable local service providers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card-elevated p-6 text-center animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/20 mb-4">
                  <feature.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Submit Your Request',
                description: 'Tell us what service you need and your location.',
              },
              {
                step: '2',
                title: 'Get Matched',
                description: 'We connect you with verified local professionals.',
              },
              {
                step: '3',
                title: 'Choose Your Pro',
                description: 'Compare quotes and pick the best fit for you.',
              },
            ].map((item, i) => (
              <div key={i} className="relative animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Businesses */}
      <section className="section-padding gradient-hero">
        <div className="container-narrow text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
            Are You a Local Business?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Get high-quality leads from customers actively looking for your services.
            Only pay for leads you want.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="/signup"
              className="btn-cta"
            >
              Start Getting Leads
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary-foreground/30 bg-transparent px-8 py-3.5 font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>LocalLead</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LocalLead. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
