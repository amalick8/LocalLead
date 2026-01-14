import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Get Supabase URL and anon key for Edge Function calls
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is not set');
}

export interface AdminPayment {
  id: string;
  user_id: string;
  lead_id: string;
  amount_cents: number;
  status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
  profile: {
    email: string;
    business_name: string | null;
  };
  lead: {
    id: string;
    name: string;
    city: string;
  };
  service: {
    name: string;
  };
}

export function useAdminPayments() {
  return useQuery({
    queryKey: ['payments', 'admin'],
    queryFn: async () => {
      // Query payments with joins to profiles (via user_id) and leads
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      if (!payments || payments.length === 0) {
        return [];
      }

      // Get unique user IDs and lead IDs
      const userIds = [...new Set(payments.map(p => p.user_id))];
      const leadIds = [...new Set(payments.map(p => p.lead_id))];

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, business_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Fetch leads with services
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          id,
          name,
          city,
          service:services(name)
        `)
        .in('id', leadIds);

      if (leadsError) throw leadsError;

      // Create lookup maps
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const leadMap = new Map((leads || []).map(l => [l.id, l]));

      // Combine data
      return payments.map((payment: any) => {
        const profile = profileMap.get(payment.user_id);
        const lead = leadMap.get(payment.lead_id);

        return {
          id: payment.id,
          user_id: payment.user_id,
          lead_id: payment.lead_id,
          amount_cents: payment.amount_cents,
          status: payment.status,
          stripe_payment_intent_id: payment.stripe_payment_intent_id,
          created_at: payment.created_at,
          profile: {
            email: profile?.email || 'Unknown',
            business_name: profile?.business_name || null,
          },
          lead: {
            id: lead?.id || payment.lead_id,
            name: lead?.name || 'Unknown',
            city: lead?.city || 'Unknown',
          },
          service: {
            name: (lead as any)?.service?.name || 'Unknown',
          },
        } as AdminPayment;
      });
    },
  });
}

export function usePurchaseLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, userId, amountCents }: { leadId: string; userId: string; amountCents: number }) => {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call Supabase Edge Function to create Stripe Checkout Session
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey!,
        },
        body: JSON.stringify({ lead_id: leadId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { checkout_url } = await response.json();

      if (!checkout_url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      window.location.href = checkout_url;

      // Return checkout URL for potential use
      return { checkout_url };
    },
    onSuccess: () => {
      // Invalidate queries after redirect (will happen when user returns)
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}
