import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { LogOut, LayoutDashboard } from 'lucide-react';

export function Header() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const scrollToSection = (id: string) => {
    if (window.location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        const headerHeight = 80; // h-20 = 80px
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      navigate(`/#${id}`);
      // Scroll will be handled by useEffect in App or Index component
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-lg">
            <img 
              src="/icon.svg" 
              alt="LocalLead Logo" 
              className="h-10 w-10"
            />
            <span className="text-slate-900">LocalLead</span>
          </Link>

          {user ? (
            <nav className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigate(role === 'admin' ? '/admin' : '/dashboard')}
                className="h-10 px-4 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                onClick={handleSignOut} 
                className="h-10 px-4 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('services-section')}
                className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Services
              </button>
              <Link
                to="/pricing"
                className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/business/get-more-leads"
                className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                For Businesses
              </Link>
            </nav>
          )}

          {!user && (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  size="default" 
                  className="h-10 px-5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  size="default" 
                  className="h-10 px-6 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
