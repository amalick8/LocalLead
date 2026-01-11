import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container-narrow text-center">
          <div className="animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold animate-fade-up">
            Request Submitted!
          </h1>

          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto animate-fade-up stagger-1">
            Thank you for your request. Local businesses will be notified and you'll hear 
            from qualified professionals soon.
          </p>

          <div className="mt-8 p-6 bg-card rounded-xl border shadow-card max-w-md mx-auto animate-fade-up stagger-2">
            <h3 className="font-semibold mb-4">What happens next?</h3>
            <ul className="space-y-3 text-left">
              {[
                'Verified businesses in your area will see your request',
                'Interested pros will reach out via your preferred method',
                'Compare quotes and choose the best fit for you',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    {i + 1}
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 animate-fade-up stagger-3">
            <Link to="/">
              <Button variant="default" size="lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-border">
        <div className="container-wide flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <img 
            src="/icon.svg" 
            alt="LocalLead Logo" 
            className="h-6 w-6"
          />
          <span>LocalLead</span>
        </div>
      </footer>
    </div>
  );
}
