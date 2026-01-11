import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePurchaseLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, userId, amountCents }: { leadId: string; userId: string; amountCents: number }) => {
      // In a real production app, this would create a Stripe checkout session
      // For now, we'll simulate the payment
      const { data, error } = await supabase
        .from('payments')
        .insert({
          lead_id: leadId,
          user_id: userId,
          amount_cents: amountCents,
          status: 'completed',
          stripe_payment_intent_id: `demo_${Date.now()}`,
        })
        .select()
        .single();

      if (error) throw error;

      // Update lead status
      await supabase
        .from('leads')
        .update({ status: 'purchased' })
        .eq('id', leadId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
