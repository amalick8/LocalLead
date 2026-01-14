import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { LeadCard } from '@/components/LeadCard';
import { useAuth } from '@/lib/auth';
import { useBusinessLeads, usePurchasedLeads } from '@/hooks/useLeads';
import { useOnboardingComplete } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Inbox, ShoppingBag, CheckCircle2, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isComplete: onboardingComplete, isLoading: onboardingLoading } = useOnboardingComplete(user?.id);
  const { data: availableLeads, isLoading: leadsLoading } = useBusinessLeads(user?.id);
  const { data: purchasedLeads, isLoading: purchasedLoading } = usePurchasedLeads(user?.id);

  // Track previous purchased count to detect new purchases after refetch
  const previousPurchasedCountRef = useRef<number>(0);
  const paymentStatusRef = useRef<string | null>(null);

  // Handle payment return URLs - detect and trigger refetch
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');

    if (paymentStatus === 'success' || paymentStatus === 'cancel') {
      // Store payment status for later verification
      paymentStatusRef.current = paymentStatus;
      
      // Store current purchased count BEFORE refetch (capture baseline)
      // Note: We intentionally read purchasedLeads here without including it in deps
      // because we want to capture the snapshot at the moment URL param is detected,
      // not react to every count change. This is the "before" state for comparison.
      previousPurchasedCountRef.current = purchasedLeads?.length || 0;

      // Trigger refetch - webhook is source of truth
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });

      // Clear URL params immediately to prevent re-triggering
      setSearchParams({}, { replace: true });
    }
    // Only depend on searchParams - don't re-run when purchasedLeads changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, queryClient, setSearchParams]);

  // Verify payment success after refetch completes
  // Only show success toast if backend confirms a new purchase
  useEffect(() => {
    // Skip if no payment status was detected or still loading
    if (!paymentStatusRef.current || leadsLoading || purchasedLoading) {
      return;
    }

    const paymentStatus = paymentStatusRef.current;
    const currentPurchasedCount = purchasedLeads?.length || 0;
    const previousCount = previousPurchasedCountRef.current;

    // Handle cancel - show immediately
    if (paymentStatus === 'cancel') {
      toast({
        title: 'Payment cancelled',
        description: 'You can try again or contact support if you need assistance.',
        variant: 'destructive',
        action: <XCircle className="text-red-500" />,
      });
      paymentStatusRef.current = null; // Reset
      return;
    }

    // Handle success - ONLY show if backend confirms new purchase
    if (paymentStatus === 'success') {
      // Verify purchase actually happened by comparing counts
      if (currentPurchasedCount > previousCount) {
        toast({
          title: 'Payment successful!',
          description: 'Your lead has been unlocked and is now available in "My Leads".',
          action: <CheckCircle2 className="text-green-500" />,
        });
      }
      // If count didn't increase, webhook may not have processed yet
      // Don't show false success - user can check "My Leads" tab
      paymentStatusRef.current = null; // Reset
    }
  }, [purchasedLeads?.length, leadsLoading, purchasedLoading, toast]);

  // Redirect logic: check auth, role, and onboarding status
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (!authLoading && role === 'admin') {
      navigate('/admin');
      return;
    }
    // Business users must complete onboarding before accessing dashboard
    if (!authLoading && !onboardingLoading && user && role === 'business' && !onboardingComplete) {
      navigate('/onboarding');
      return;
    }
  }, [user, role, authLoading, onboardingLoading, onboardingComplete, navigate]);

  // Show loading while checking auth or onboarding status
  if (authLoading || onboardingLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const unpurchasedLeads = availableLeads?.filter(l => !l.is_purchased) || [];

  const purchasedCount = purchasedLeads?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 pt-24">
        <Tabs defaultValue="available" className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-8 border-2 border-blue-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Leads</h1>
            <div className="flex flex-wrap gap-4 text-base">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="font-semibold text-gray-700">{unpurchasedLeads.length} Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                <span className="font-semibold text-gray-700">{purchasedCount} Unlocked</span>
              </div>
            </div>
          </div>

          <TabsList className="bg-white border-2 border-gray-200 shadow-md p-1">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Available Leads
              {unpurchasedLeads.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-600 text-white text-xs font-medium">
                  {unpurchasedLeads.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="purchased" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              My Leads
              {purchasedCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-green-600 text-white text-xs font-medium">
                  {purchasedCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            {leadsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : unpurchasedLeads.length === 0 ? (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 mb-6">
                    <Inbox className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No leads yet</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    New customer requests will appear here. Check back soon!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {unpurchasedLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchased">
            {purchasedLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : purchasedCount === 0 ? (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 mb-6">
                    <ShoppingBag className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No purchased leads yet</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Leads you purchase will appear here with full contact details.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {purchasedLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={{ ...lead, is_purchased: true }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
