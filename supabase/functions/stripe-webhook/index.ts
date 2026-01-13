// Supabase Edge Function: Stripe Webhook Handler
// Deploy: supabase functions deploy stripe-webhook
// Configure webhook in Stripe Dashboard: https://dashboard.stripe.com/webhooks
// Endpoint: https://<project-ref>.supabase.co/functions/v1/stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Stripe keys from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Get webhook signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const leadId = session.metadata?.lead_id;
      const userId = session.metadata?.user_id;
      const paymentIntentId = session.payment_intent as string;

      if (!leadId || !userId) {
        console.error('Missing metadata in checkout session:', session.id);
        return new Response(
          JSON.stringify({ error: 'Missing required metadata' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use a transaction-like approach: update payment and lead atomically
      // First, check if payment already completed (idempotency)
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('status')
        .eq('lead_id', leadId)
        .eq('user_id', userId)
        .single();

      if (existingPayment?.status === 'completed') {
        console.log('Payment already completed, skipping:', leadId);
        return new Response(
          JSON.stringify({ received: true, message: 'Payment already processed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update payment status to completed (idempotent: only pending -> completed)
      const { data: paymentUpdate, error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          stripe_payment_intent_id: paymentIntentId,
        })
        .eq('lead_id', leadId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .select('id');

      // If no pending payment was updated, check if already completed
      if ((paymentUpdate ?? []).length === 0) {
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('status')
          .eq('lead_id', leadId)
          .eq('user_id', userId)
          .single();

        if (existingPayment?.status === 'completed') {
          console.log('Payment already completed, skipping lead update:', leadId);
          return new Response(
            JSON.stringify({ received: true, message: 'Payment already processed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (paymentError) {
          console.error('Error updating payment:', paymentError);
          throw new Error('Failed to update payment status');
        }
      }

      // Update lead status to purchased (only if it is still 'new')
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'purchased' })
        .eq('id', leadId)
        .eq('status', 'new');

      if (leadError) {
        console.error('Error updating lead status:', leadError);
        throw new Error('Failed to update lead status');
      }

      console.log('Payment processed successfully:', { leadId, userId, paymentIntentId });
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
