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
