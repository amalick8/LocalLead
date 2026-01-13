# Stripe Payment Integration Setup Guide

This guide explains how to set up and test the Stripe payment integration for LocalLead.

---

## Prerequisites

1. **Stripe Account**: Sign up at https://stripe.com (use test mode for development)
2. **Supabase Project**: Edge Functions must be enabled
3. **Environment Variables**: Set up required keys

---

## Part 1: Install Dependencies

Install Stripe SDK (if not already installed):

```bash
npm install stripe
```

**Note**: The Supabase Edge Functions use Deno imports, so no npm install needed for functions.

---

## Part 2: Environment Variables

### Frontend (.env)

Add to your `.env` file:

```bash
# Stripe Publishable Key (from Stripe Dashboard)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase (already configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Edge Functions

Set secrets in Supabase Dashboard or via CLI:

```bash
# Stripe Secret Key (from Stripe Dashboard)
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret (get after creating webhook)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Service Role Key (for webhook)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to set secrets:**

1. **Via Supabase Dashboard:**
   - Go to Project Settings → Edge Functions → Secrets
   - Add each secret

2. **Via CLI:**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   ```

---

## Part 3: Deploy Supabase Edge Functions

### Deploy Checkout Function

```bash
supabase functions deploy create-checkout
```

### Deploy Webhook Function

```bash
supabase functions deploy stripe-webhook
```

**Function URLs:**
- Checkout: `https://<project-ref>.supabase.co/functions/v1/create-checkout`
- Webhook: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`

---

## Part 4: Configure Stripe Webhook

1. **Go to Stripe Dashboard:**
   - Navigate to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"

2. **Set Endpoint URL:**
   ```
   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
   ```

3. **Select Events:**
   - `checkout.session.completed`

4. **Copy Webhook Secret:**
   - After creating, copy the "Signing secret" (starts with `whsec_`)
   - Set it as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

---

## Part 5: Testing

### Test Card Numbers

Use Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

**Test Card Details:**
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Test Flow

1. **Start Dev Server:**
   ```bash
   npm run dev
   ```

2. **Login as Business User:**
   - Sign up or login at `/login`
   - Navigate to `/dashboard`

3. **Purchase a Lead:**
   - Click "Unlock Lead for $X" on any available lead
   - You'll be redirected to Stripe Checkout

4. **Complete Payment:**
   - Use test card: `4242 4242 4242 4242`
   - Fill in any future expiry, CVC, ZIP
   - Click "Pay"

5. **Verify Success:**
   - You'll be redirected to `/dashboard?payment=success`
   - Toast notification shows "Payment successful!"
   - Lead appears in "My Leads" tab with full contact details

---

## Part 6: Verify Payment in Database

### Check Payments Table

```sql
SELECT 
  id,
  user_id,
  lead_id,
  amount_cents,
  status,
  stripe_payment_intent_id,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**
- `status` = `'completed'`
- `stripe_payment_intent_id` = Stripe payment intent ID (starts with `pi_`)

### Check Leads Table

```sql
SELECT 
  id,
  name,
  status,
  updated_at
FROM leads
WHERE status = 'purchased'
ORDER BY updated_at DESC;
```

**Expected:**
- `status` = `'purchased'`
- `updated_at` = timestamp of purchase

---

## Part 7: Verify in Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - Navigate to: https://dashboard.stripe.com/test/payments

2. **Check Payment:**
   - Should see payment with amount matching lead price
   - Status: "Succeeded"
   - Metadata: `lead_id`, `user_id`, `service_name`

3. **Check Webhook Events:**
   - Navigate to: https://dashboard.stripe.com/test/webhooks
   - Click on your webhook endpoint
   - View "Events" tab
   - Should see `checkout.session.completed` event

---

## Troubleshooting

### Payment Not Completing

1. **Check Webhook Logs:**
   ```bash
   supabase functions logs stripe-webhook
   ```

2. **Check Checkout Logs:**
   ```bash
   supabase functions logs create-checkout
   ```

3. **Verify Secrets:**
   ```bash
   supabase secrets list
   ```

### Common Issues

**Issue**: "STRIPE_SECRET_KEY not set"
- **Fix**: Set secret via `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`

**Issue**: "Webhook signature verification failed"
- **Fix**: Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard

**Issue**: "Lead not found or already purchased"
- **Fix**: Check that lead exists and `status = 'new'` in database

**Issue**: "Payment already completed"
- **Fix**: This is idempotency protection. Check if payment already exists.

---

## Files Modified/Created

### New Files

1. **`supabase/functions/create-checkout/index.ts`**
   - Creates Stripe Checkout Session
   - Creates pending payment record
   - Returns checkout URL

2. **`supabase/functions/stripe-webhook/index.ts`**
   - Handles Stripe webhook events
   - Updates payment status to 'completed'
   - Updates lead status to 'purchased'
   - Prevents double-purchase with idempotency checks

### Modified Files

1. **`src/hooks/usePayments.ts`**
   - Removed fake payment logic
   - Calls Edge Function to create checkout session
   - Redirects to Stripe Checkout

2. **`src/pages/Dashboard.tsx`**
   - Added payment return URL handling
   - Shows success/cancel toasts
   - Refreshes data after payment

3. **`package.json`**
   - Added `stripe` dependency (install manually: `npm install stripe`)

---

## Environment Variables Summary

### Frontend (.env)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### Supabase Secrets
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
```

---

## Security Notes

1. **Never commit secrets** - Use `.env` and Supabase secrets
2. **Webhook signature verification** - Always verify webhook signatures
3. **Idempotency** - Webhook handler checks for duplicate payments
4. **RLS still enforced** - Database RLS policies remain active
5. **Service role key** - Only used in webhook (server-side only)

---

## Production Checklist

Before going live:

- [ ] Switch to Stripe live mode keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real card (small amount)
- [ ] Verify webhook events in Stripe Dashboard
- [ ] Check database for correct payment records
- [ ] Test payment cancellation flow
- [ ] Verify error handling

---

**Last Updated:** 2025-01-13
