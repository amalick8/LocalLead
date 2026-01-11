import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { Footer } from '@/components/footer';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';

const signupSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const benefits = [
  'Access qualified leads in your area',
  'Only pay for leads you want',
  'No monthly fees or contracts',
];

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.businessName);

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Account created!',
        description: 'Welcome to LocalLead. Start browsing leads now.',
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-32 pb-20 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Benefits */}
            <div className="lg:sticky lg:top-28">
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">
                Grow your business with quality leads
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                Join hundreds of local businesses getting customers through LocalLead.
              </p>

              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Signup Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 lg:p-10 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">Create your account</h2>
                <p className="text-sm sm:text-base text-slate-600">Get started in less than a minute.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-sm font-medium text-slate-700">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    placeholder="Your Business Name"
                    className="h-12 text-base border border-slate-300 bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                  />
                  {errors.businessName && (
                    <p className="text-sm text-red-600 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">{errors.businessName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@business.com"
                    className="h-12 text-base border border-slate-300 bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="h-12 text-base border border-slate-300 bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="h-12 text-base border border-slate-300 bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow transition-all duration-200 mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-600 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
