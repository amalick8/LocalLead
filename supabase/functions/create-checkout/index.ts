// Supabase Edge Function: Create Stripe Checkout Session
// Deploy: supabase functions deploy create-checkout

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { lead_id } = await req.json();
    if (!lead_id) {
      return new Response(
        JSON.stringify({ error: 'lead_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify lead exists and is available
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        service:services(id, name, price_cents)
      `)
      .eq('id', lead_id)
      .eq('status', 'new')
      .single();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead not found or already purchased' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already purchased this lead
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('lead_id', lead_id)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: 'Lead already purchased' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build absolute return URLs (required by Stripe)
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const successUrl = `${origin}/dashboard?payment=success`;
    const cancelUrl = `${origin}/dashboard?payment=cancel`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${lead.service.name} Lead`,
              description: `Lead for ${lead.service.name} in ${lead.city}`,
            },
            // price_cents is already in cents; do not divide
            unit_amount: lead.service.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        lead_id: lead.id,
        user_id: user.id,
        service_name: lead.service.name,
      },
      client_reference_id: lead.id,
    });

    // Create pending payment record
    const { error: paymentError } = await supabase.from('payments').insert({
      lead_id: lead.id,
      user_id: user.id,
      amount_cents: lead.service.price_cents,
      status: 'pending',
      stripe_payment_intent_id: session.payment_intent as string,
    });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      // Still return checkout URL - webhook will handle payment record
    }

    return new Response(
      JSON.stringify({ checkout_url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
