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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <img 
              src="/icon.svg" 
              alt="LocalLead Logo" 
              className="h-11 w-11"
            />
            <span className="text-slate-800">LocalLead</span>
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => navigate(role === 'admin' ? '/admin' : '/dashboard')}
                  className="h-10 px-4"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="outline" size="default" onClick={handleSignOut} className="h-10 px-4">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="default" className="h-10 px-5 text-base font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="cta" size="default" className="h-10 px-6 text-base font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
