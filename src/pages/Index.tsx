import { Header } from '@/components/Header';
import { LandingHero } from '@/components/landing-hero';
import { ServicesGrid } from '@/components/services-grid';
import { HowItWorks } from '@/components/how-it-works';
import { TrustIndicators } from '@/components/trust-indicators';
import { Footer } from '@/components/footer';

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <LandingHero />
      <HowItWorks />
      <ServicesGrid />
      <TrustIndicators />
      <Footer />
    </div>
  );
}
