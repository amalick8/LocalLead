import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Get Supabase URL and anon key for Edge Function calls
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is not set');
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
