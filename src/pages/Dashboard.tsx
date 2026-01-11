import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { LeadCard } from '@/components/LeadCard';
import { useAuth } from '@/lib/auth';
import { useBusinessLeads, usePurchasedLeads } from '@/hooks/useLeads';
import { Loader2, Inbox, ShoppingBag, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { data: availableLeads, isLoading: leadsLoading } = useBusinessLeads(user?.id);
  const { data: purchasedLeads, isLoading: purchasedLoading } = usePurchasedLeads(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (!authLoading && role === 'admin') {
      navigate('/admin');
    }
  }, [user, role, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const unpurchasedLeads = availableLeads?.filter(l => !l.is_purchased) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container-wide">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Leads Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Browse and purchase leads for your business
            </p>
          </div>

          <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="bg-muted p-1">
              <TabsTrigger value="available" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Available Leads
                {unpurchasedLeads.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {unpurchasedLeads.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="purchased" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                My Leads
                {purchasedLeads && purchasedLeads.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {purchasedLeads.length}
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
                <div className="text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No leads available</h3>
                  <p className="text-muted-foreground mt-1">
                    Check back soon for new leads in your area.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              ) : !purchasedLeads || purchasedLeads.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No purchased leads yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Leads you purchase will appear here with full contact details.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </main>

      <footer className="py-8 border-t border-border">
        <div className="container-wide flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span>LocalLead</span>
        </div>
      </footer>
    </div>
  );
}
