## READ-ONLY STATUS AUDIT — LocalLead (snapshot at “Add onboarding route and enhance lead filtering in useLeads hook”)

This is a factual inventory of what exists **right now in the workspace** (code + migrations), marked ✅/⚠️/❌.

---

## 1) ROUTING & ACCESS FLOW

### ✅ Completed — What is DONE
- **Onboarding route exists**: `/onboarding` is registered in `src/App.tsx`.
- **Dashboard gating exists (frontend)**: `src/pages/Dashboard.tsx` redirects business users to `/onboarding` if onboarding is incomplete.
- **Admin vs business routing exists (frontend)**:
  - `Dashboard.tsx` redirects admins to `/admin`.
  - `Admin.tsx` redirects non-admins to `/dashboard`.
- **Auth redirect behavior exists (frontend)**:
  - `Dashboard.tsx`: if not authenticated → `/login`
  - `Onboarding.tsx`: if not authenticated → `/login`
  - `Admin.tsx`: if not authenticated → `/login`

### ⚠️ Partially implemented — What is NOT DONE / caveats
- Role is fetched async in `src/lib/auth.tsx` (via `user_roles`), so there can be brief “loading / role unknown” windows; routing relies on that state being correct.

### ✅ Safe to launch with
- Frontend routing/gating behavior for onboarding/admin is present and coherent.

### ⚠️ Must be fixed before production
- Nothing strictly blocking production in this section *by itself*, assuming roles and profile completion checks are reliable (see onboarding section).

---

## 2) BUSINESS ONBOARDING

### ✅ Completed — What is DONE
- **Required onboarding fields (by frontend logic)** in `src/pages/Onboarding.tsx`:
  - `business_type` (min 1)
  - `service_description` (min 10)
  - `city` (min 2)
  - `state` (min 2)
  - `zip_code` (min 5)
- **Onboarding completion check exists**:
  - `useOnboardingComplete()` in `src/hooks/useProfile.ts` treats onboarding complete if all 5 fields above are truthy.
- **Profile fields exist in schema (migration)**:
  - `supabase/migrations/20260113000000_extend_profiles_targeting.sql` adds: `business_type`, `service_description`, `city`, `state`, `zip_code`, and `country default 'US'` (NOT NULL).

### ⚠️ Partially implemented — What is NOT DONE / failure cases
- **Profile save uses UPDATE (not UPSERT)**:
  - `useUpdateProfile()` in `src/hooks/useProfile.ts` uses `.update(...).eq('id', updates.id).single()`.
  - If the `profiles` row does **not** exist yet, UPDATE matches 0 rows → onboarding can fail.
- **Profiles are not guaranteed to exist**:
  - There *is* a `handle_new_user()` trigger referenced in migrations (e.g. `20260111074313...`), but from the frontend alone, you cannot assume it always ran or created the profile row.
- **Country handling**:
  - Onboarding UI does not include `country`, and the save call does not explicitly set it. The schema migration indicates `country` is `NOT NULL DEFAULT 'US'`, but if the column existed without default in earlier environments, inserts/updates could be brittle.

### ⚠️ Safe to launch with
- Safe for **test/staging** if you know the `profiles` row is always created by DB trigger in your environment.

### ❌ Must be fixed before production
- **Reliability of profile save** is a production blocker if any business user can reach onboarding without an existing profile row. Current implementation can produce the exact failure described (UPDATE-with-no-row).

---

## 3) LEAD INTAKE (PUBLIC)

### ✅ Completed — What is DONE
- **Fields collected** (`src/components/LeadForm.tsx`):
  - `service_id` (required)
  - `name` (required)
  - `city` (required)
  - `zip_code` (optional)
  - `description` (required, min 10)
  - `contact_preference` (required: `email` or `phone`)
  - `email` required if preference is email; `phone` required if preference is phone
- **Validation**:
  - Zod schema + extra conditional checks for email/phone based on contact preference.
- **Styling/UX polish**:
  - Large inputs (`h-14`, `text-lg`), clear error text, smooth disabled/loading states.

### ⚠️ Partially implemented — What is NOT DONE
- **Location granularity**:
  - Lead intake collects **city** (required) and **zip_code** (optional).
  - It does **not** collect state/country on leads.

### ✅ Safe to launch with
- Public lead intake is complete and reasonably polished.

### ✅ Must be fixed before production
- No clear production blocker here from the code shown.

---

## 4) BUSINESS DASHBOARD

### ✅ Completed — What is DONE
- Business dashboard shows:
  - **Available Leads** (status `new`, minus those already purchased by that user)
  - **My Leads** (leads linked to user’s completed payments)
- **Purchased vs available determination**:
  - `usePurchasedLeads()` pulls completed payments for the user, then fetches those leads.
  - `useBusinessLeads()` fetches `new` leads and marks `is_purchased` based on user’s completed payments.

### ⚠️ Partially implemented — Filtering enforcement
- **Lead filtering logic exists in the UI/query layer** (`src/hooks/useLeads.ts`):
  - Service match: `profile.business_type` (string) → lookup `services.id` by `services.name`.
  - Location match: in-memory filter for **city OR zip_code** match.
- **But RLS does not enforce targeting**:
  - RLS policy “Business users can view available leads” is simply:
    - business role AND `status='new'`
  - So a business client can still read **all `new` leads** regardless of targeting, if they bypass the UI filter.

### ⚠️ Safe to launch with
- Safe as a **product behavior** for a controlled MVP, as long as you accept that “targeting” is not a security boundary.

### ⚠️ Must be fixed before production
- If lead targeting is meant to be **access control**, this is a production blocker (it’s currently UI-only).

---

## 5) PAYMENTS (STRIPE)

### ✅ Completed — What is DONE
- **Real Stripe Checkout is wired**:
  - Frontend calls Edge Function `create-checkout` and redirects to Stripe (`src/hooks/usePayments.ts`).
  - Backend Edge Function `supabase/functions/create-checkout/index.ts` creates a Checkout Session and inserts a `payments` row with `status='pending'`.
- **Webhook exists and verifies signature**:
  - `supabase/functions/stripe-webhook/index.ts` verifies `stripe-signature` and handles `checkout.session.completed`.
- **Payment → lead unlock flow**:
  - Webhook updates `payments.status` to `completed` and updates `leads.status` to `purchased` (only if lead is still `new`).
- **Idempotency/double-purchase protections**:
  - Create-checkout checks for existing completed payment for that user+lead.
  - Webhook checks if payment already completed and only updates pending→completed.
  - Lead update is guarded by `status='new'`.
  - DB has unique constraint on `(user_id, lead_id)` (per schema intent).

### ⚠️ Partially implemented — What is NOT DONE / caveats
- No evidence of a true DB transaction spanning both updates in webhook (it’s a safe sequence, but not an explicit SQL transaction in the function).
- `create-checkout` returns `checkout_url` and `session_id` (return shape differs from “return only checkout URL” requirement in earlier prompts).

### ✅ Safe to launch with
- **Test-mode launch** is viable if Stripe secrets and webhook are configured.

### ⚠️ Must be fixed before production
- Production readiness depends on:
  - Stripe webhook deployment + secret management
  - Ensuring RLS/service-role usage is correct (see security section)

---

## 6) ADMIN DASHBOARD

### ✅ Completed — What is DONE
- Admin dashboard (`src/pages/Admin.tsx`) includes:
  - Services & pricing management (create/update)
  - Leads table (view all leads)
  - Manual expire action (calls `expire_lead`)
  - Businesses table (lists profiles)
  - Payments tab (read-only payments table)
  - Analytics cards (from `get_lead_analytics`)

### ⚠️ Partially implemented — What is NOT DONE
- “Manage businesses” is limited to **viewing** profiles in a table.
  - No UI actions shown for editing business details, changing email, deleting business, etc.

### ✅ Safe to launch with
- Admin view/edit for services + read-only oversight (leads/payments) is present.

### ⚠️ Must be fixed before production
- Depends on security posture of admin-only operations (see section 7).

---

## 7) DATABASE & SECURITY

### ✅ Completed — What is DONE
- **RLS coverage exists** for: `profiles`, `user_roles`, `services`, `leads`, `payments` (see `20260111074313...` and initial schema).
- **Role enforcement mechanism**:
  - DB helper `public.has_role(auth.uid(), 'admin'|'business')` used in policies.
  - Frontend also routes based on `role` from `user_roles`.
- **Key lead/payment RLS behaviors** (from migrations):
  - Leads:
    - anyone can insert leads
    - admins can select all leads
    - business users can select:
      - purchased leads (exists completed payment)
      - available leads (status=new AND business role)
  - Payments:
    - users can select own payments
    - users can insert own payments
    - admins can select all payments

### ⚠️ Partially implemented — SECURITY DEFINER & grants risk
- **SECURITY DEFINER functions are present**, notably in:
  - `20260114000000_lead_expiration_and_analytics.sql` (`expire_old_leads`, `expire_lead`, `get_lead_analytics`)
- **Potentially over-permissive grants exist**:
  - That migration grants:
    - `GRANT EXECUTE ON FUNCTION public.expire_lead(UUID) TO authenticated;`
    - `GRANT EXECUTE ON FUNCTION public.get_lead_analytics() TO authenticated;`
  - Because these functions are `SECURITY DEFINER`, they may bypass RLS unless they implement their own role checks.

### ⚠️ Safe to launch with
- Safe for internal testing if authenticated access is trusted and you’re okay with broader visibility/abilities.

### ❌ Must be fixed before production
- Any `SECURITY DEFINER` function exposed to `authenticated` without explicit role checks is a **security risk** (can enable non-admin users to perform admin-like actions or view global analytics).

---

## 8) DEPLOYMENT READINESS

### ✅ Completed — What is DONE
- Stripe docs exist:
  - `STRIPE_SETUP.md`
  - `STRIPE_INTEGRATION_STATUS.md`
- Edge Functions exist for Stripe:
  - `create-checkout`
  - `stripe-webhook`

### ⚠️ Partially implemented — Potential blockers
- Environment variables must be present in the correct places:
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Supabase secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### ✅ Safe to launch with (test mode)
- Test-mode launch is feasible if Stripe + Supabase secrets are configured and functions are deployed.

### ❌ Must be fixed before real production launch
- **Onboarding reliability** (UPDATE vs missing profile row) can block user onboarding.
- **SECURITY DEFINER + broad EXECUTE grants** may be production-blocking from a security standpoint.
- **UI-only targeting** may be unacceptable if lead access control must be enforced server-side.
