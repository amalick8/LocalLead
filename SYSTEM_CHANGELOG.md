### CHANGELOG + System Explanation (LocalLead)

This is a **read-only** explanation of what exists in the repo right now, based on the current code and migrations.

---

## SECTION 1 — PAYMENT SYSTEM

### How Stripe Checkout is implemented
- **Frontend initiates checkout** via `usePurchaseLead()` in `src/hooks/usePayments.ts`.
  - It calls Supabase Edge Function `create-checkout` at `.../functions/v1/create-checkout` with `lead_id`, including the user’s JWT (`Authorization: Bearer ...`) and anon key (`apikey`).
  - It then **redirects the browser** to `checkout_url` returned by the function.
- **Backend creates the session** in `supabase/functions/create-checkout/index.ts`:
  - Reads **Stripe secret** from `Deno.env.get('STRIPE_SECRET_KEY')`.
  - Authenticates user via `supabase.auth.getUser()` using the passed JWT.
  - Validates lead exists and is **status = 'new'**.
  - Creates Stripe Checkout Session (`mode: 'payment'`) with:
    - `unit_amount = service.price_cents` (already in cents)
    - metadata: `lead_id`, `user_id`
    - return URLs: `/dashboard?payment=success|cancel` (absolute origin derived from request)
  - Inserts a **payments** row with `status='pending'` and `stripe_payment_intent_id = session.payment_intent`.

### Why the frontend cannot mark payments as complete
- The frontend never updates `payments.status` or `leads.status`.
- Stripe payment completion is **only** recognized once the **webhook** updates the database.
- This avoids the “client lies” problem (URL params, local state, fake IDs, etc. can be forged).

### How the webhook works
- Implemented in `supabase/functions/stripe-webhook/index.ts`.
- Reads:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_URL`
- Verifies Stripe signature using `stripe.webhooks.constructEvent(body, signature, webhookSecret)`.
- On `checkout.session.completed`:
  - Extracts `lead_id`, `user_id` from `session.metadata`
  - Extracts `payment_intent` from `session.payment_intent`
  - Uses **SERVICE ROLE Supabase client** to update DB.

### Idempotency handling
Webhook does two idempotency checks:
- **Early return** if an existing payment row for `(lead_id, user_id)` is already `status='completed'`.
- Payment update is restricted to **pending → completed**:
  - `update payments set status='completed' ... where status='pending'`

### Double-purchase prevention
There are multiple layers:
- **Checkout creation** refuses if:
  - lead is not `status='new'`
  - or a completed payment already exists for that user+lead
- **Database uniqueness**: `payments` has `UNIQUE(user_id, lead_id)` (from schema).
- **Webhook lead update guard**: updates `leads` only where `status='new'`.
- **DB trigger (important)**: `validate_lead_purchase()` in `20250113000000_initial_schema.sql` prevents updating a lead to `purchased` unless a `payments.status='completed'` exists for that lead.

### payments.status transitions
Current intended lifecycle:
- `pending`: created before charge (inserted in `create-checkout`)
- `completed`: set by webhook on `checkout.session.completed`

Schema note:
- `20250113000000_initial_schema.sql` originally defaulted `payments.status` to `'completed'` (inconsistent).
- `supabase/migrations/20260112000000_fix_payments_status_default.sql` changes the default to `'pending'`.
- Another migration (`20260111074313_...`) already defines default `'pending'` for `payments` (schema-safe). Net effect: **default should now be pending**, but historically there was inconsistency.

### Security enforcement (env vars, service role, RLS)
- **Keys**: never hardcoded; all Stripe keys come from Edge Function env (`Deno.env.get(...)`).
- **Service role usage**: webhook uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) so it can update `payments`/`leads` regardless of user session.
- **RLS**:
  - Business users can only select their own payments.
  - Business users can select leads in two categories:
    - purchased leads (exists completed payment for that user)
    - available leads (status='new')
  - Admins can see all leads, payments, profiles.

---

## SECTION 2 — BUSINESS DASHBOARD

### What business users see
Implemented in `src/pages/Dashboard.tsx`:
- A dashboard with two tabs:
  - **Available Leads**
  - **My Leads** (purchased/unlocked)

### How available vs purchased leads are determined
- **Available leads**: fetched by `useBusinessLeads(userId)` from `src/hooks/useLeads.ts`
  - It fetches leads with `status='new'`
  - Then marks each lead with `is_purchased` based on whether there is a completed payment for that lead/user.
- **Purchased leads**: fetched by `usePurchasedLeads(userId)`
  - It queries payments for `status='completed'` and loads those leads.

### How lead unlocking works
- UI uses `lead.is_purchased` to decide whether to show real contact details.
- Unlock happens only after webhook sets:
  - `payments.status='completed'`
  - `leads.status='purchased'`
- Business-facing contact info is effectively “unlocked” when the **payments query** returns that lead in completed payments.

### How location and service filtering works
Implemented in `useBusinessLeads()`:
- Reads business profile via `useProfile(userId)` (client-side).
- Service matching:
  - Takes `profile.business_type` (stored as service name string)
  - Looks up `services.id` by matching `services.name == profile.business_type`
  - Filters leads by `service_id` if matched
- Location matching:
  - Filters results in memory: lead matches if **city matches OR zip matches**
  - City match is case-insensitive trim compare
  - Zip match removes non-digits on both sides

Important reality check:
- This targeting is **not enforced by RLS**. RLS still allows business users to select all leads with `status='new'`.
- So targeting is currently **a product/UX filter**, not a security boundary.

### What happens after a successful or cancelled payment
Dashboard behavior:
- Detects `?payment=success|cancel` on return from Stripe.
- Always triggers refetch (`invalidateQueries`) and clears URL params immediately.
- Toast behavior:
  - **Cancel**: shows destructive “Payment cancelled”.
  - **Success**: shows “Payment successful” **only if** the refetch reveals purchased count increased (backend-confirmed). Otherwise no false-success toast.

---

## SECTION 3 — LEAD INTAKE (PUBLIC USERS)

### What information is collected from individuals
From `src/components/LeadForm.tsx` and DB schema:
- `service_id` (required)
- `name` (required)
- `description` (required, min 10 chars)
- `city` (required)
- `zip_code` (optional)
- `contact_preference` (required: phone/email)
- `email` or `phone` required depending on contact preference

### Why city/state/country are required
What exists today:
- **City is required** (both schema and form).
- **State and country are not collected on leads** and are not present in the `leads` table schema. So this part is **not implemented** for lead intake.

### How styling and UX were improved
Lead form has clear UX upgrades:
- Large inputs (`h-14`, `text-lg`), better focus/hover states, clear empty/loading states for service dropdown.
- Inline error messaging with subtle animation classes.
- Conditional rendering for email vs phone depending on contact preference.

### How validation works
- Zod schema validation for core fields.
- Additional conditional validation: if contact preference is email/phone, the corresponding contact field must be present.

### How leads enter the system safely without auth
- RLS policy in schema: `"Anyone can create leads"` allows `INSERT` to `public.leads` with `WITH CHECK (true)`.
- Public users cannot read leads due to RLS; only insert.

---

## SECTION 4 — BUSINESS PROFILING & ONBOARDING

### What information businesses must provide
From `src/pages/Onboarding.tsx` + `src/hooks/useProfile.ts` + `20260113000000_extend_profiles_targeting.sql`:
- Required (for onboarding completion check):
  - `business_type` (stored as text; chosen from service names)
  - `service_description`
  - `city`
  - `state`
  - `zip_code`
- Also added to profiles:
  - `country` default `'US'` (not required by onboarding, but stored)

### Why onboarding is required before dashboard access
- `src/pages/Dashboard.tsx` blocks business users from `/dashboard` unless onboarding is complete:
  - Uses `useOnboardingComplete(userId)` which checks required profile fields are truthy.
  - Redirects to `/onboarding` if incomplete.
- Admin users skip onboarding entirely and are routed to `/admin`.

### How business type and location are stored
- Stored on `public.profiles` columns added by `20260113000000_extend_profiles_targeting.sql`.
- Saved by `useUpdateProfile()` which updates the profile row where `id = auth.uid()` (enforced by RLS).

### How this data is later used for targeting
- Used in `useBusinessLeads()` to filter leads by:
  - **service_id match** (via service lookup from business_type string)
  - **zip OR city match**

---

## SECTION 5 — ADMIN DASHBOARD & POWERS

### What admins can see
From `src/pages/Admin.tsx`:
- **Analytics cards** (derived from RPC function `get_lead_analytics()`).
- Tabs:
  - Services & Pricing
  - All Leads
  - Businesses
  - Payments

### What admins can edit (currently)
- **Services**:
  - Create a service
  - Update service pricing (and presumably other service fields via existing hooks)
- **Leads**:
  - Manually expire leads via “Expire” button (calls RPC `expire_lead`)
- **Profiles**:
  - Admin UI currently **only displays** businesses (no edit UI shown in current `Admin.tsx`).

### Edit business details / Change emails / Delete businesses
What exists today:
- There is **no admin UI** in `Admin.tsx` that edits profiles, changes emails, or deletes users/businesses.
- RLS and DB triggers also do not define admin delete/update policies for profiles beyond:
  - `Admins can update all profiles` (added in `202601130...`) and `Admins can view all profiles`.
- Changing auth emails / deleting users would require interacting with Supabase Auth admin APIs (not present here).

### Why these powers are restricted / how admin access is enforced
- Frontend routing:
  - `Dashboard.tsx` redirects admins to `/admin`.
  - `Admin.tsx` redirects non-admins back to `/dashboard`.
- Backend/RLS:
  - `has_role(auth.uid(), 'admin')` governs admin read access to payments/profiles/leads.
  - However: some new functions are `SECURITY DEFINER` (see Section 6/7 notes) which can bypass RLS if not explicitly restricted.

---

## SECTION 6 — LEAD TARGETING & INVENTORY CONTROL

### How leads are filtered per business
- Implemented in `useBusinessLeads()` (client-side query + client-side filtering).
- Uses profile fields to filter:
  - Match service (if business_type maps to a service)
  - Match location (zip OR city)

Security note:
- Because RLS allows businesses to `SELECT` all leads with `status='new'`, this is **not a hard security boundary**. A determined client could bypass filtering if they query directly.

### How lead expiration works (auto + manual)
- DB functions added in `20260114000000_lead_expiration_and_analytics.sql`:
  - `expire_old_leads()` updates leads older than 30 days from `new` → `expired`.
  - `expire_lead(lead_id)` updates one lead from `new` → `expired`.
- Admin UI:
  - “Expire” button in Admin → Leads tab calls `supabase.rpc('expire_lead', { lead_id })`.

Scheduling note:
- Auto-expiration scheduling is described as pg_cron comments; there is **no deployed scheduled job in code** (it must be configured in Supabase).

### Why this prevents marketplace chaos / how stale inventory is handled
- Expiration removes stale leads from the “new” pool (assuming business lead query only fetches `status='new'`, which it does).
- Manual expiration gives admins a way to prune inventory immediately.

Critical security/design note (current state):
- Both `expire_lead` and `get_lead_analytics` are defined as `SECURITY DEFINER` and granted to `authenticated`.
- As written, a **non-admin authenticated user could potentially call `expire_lead`** and expire leads, because the function itself does not check role and `SECURITY DEFINER` can bypass RLS. This is a significant mismatch vs intended “admin-only”.

---

## SECTION 7 — ANALYTICS & OPERATIONS

### What metrics are tracked
From `get_lead_analytics()`:
- Total leads
- Purchased leads
- Expired leads
- New leads
- Total revenue (sum of completed payments)
- Avg lead price (based on services.price_cents for purchased leads)
- Conversion rate: purchased / total * 100

### Where they are displayed
- Admin dashboard shows analytics in two rows of cards (`Admin.tsx`):
  - Total Leads, Purchased, Revenue, Businesses
  - New Leads, Expired, Conversion Rate, Avg Lead Price

### How they help business decisions
- Revenue + average price: pricing and revenue tracking.
- Conversion: how effectively leads are getting purchased.
- New vs expired: health of inventory and freshness.

### What is intentionally NOT tracked yet
Not present in schema/functions/UI:
- Per-business conversion, cohort retention, LTV, churn
- Funnel metrics (views → clicks → checkouts → paid)
- Stripe fee breakdown, refunds, disputes
- Geographic distribution beyond city/zip matching
- Time-to-purchase / lead aging analytics

Security note (current state):
- `get_lead_analytics()` is `SECURITY DEFINER` and granted to `authenticated`, so a business user might be able to call it and see global metrics (depending on Supabase function exposure). That’s likely not intended.

---

## SECTION 8 — SECURITY MODEL SUMMARY

### Auth vs RLS responsibilities
- **Auth**: verifies identity (Supabase Auth session + JWT).
- **RLS**: controls what rows a user can read/insert/update in Postgres.
- **Edge Functions**:
  - `create-checkout` uses **anon key + user JWT**, so RLS still applies.
  - `stripe-webhook` uses **service role**, bypassing RLS intentionally for system-level writes.

### Role separation (business vs admin)
- Roles are stored in `public.user_roles`.
- `public.has_role(auth.uid(), 'admin')` is used in RLS to gate admin privileges.
- Frontend also routes admins to `/admin`.

### Why this design is safe (payments)
- The client does not (and cannot, by design) flip payment/lead status to “completed/purchased”.
- Webhook signature verification ensures Stripe is the source of truth.
- Database trigger `validate_lead_purchase` prevents lead purchase without completed payment.

### Why frontend trust is minimized
- URL params are treated as “return hints”, not proof.
- The dashboard verifies purchase by **refetching** and checking backend-confirmed state.

---

## System Status Summary

### What the platform is capable of now
- **Real Stripe Checkout** purchase flow with **webhook-confirmed lead unlocking**.
- **Business onboarding** required before dashboard access (admins skip).
- **Lead targeting (service + city/zip)** implemented at the query/UI layer.
- **Admin dashboard** with:
  - Services management (create/update pricing)
  - Leads view + manual expire
  - Payments read-only table
  - High-level analytics cards
- **Lead expiration** functions exist (manual + auto function), with optional cron scheduling via Supabase setup.

### What is intentionally deferred / not yet implemented (or incomplete)
- **Server-enforced lead targeting** (currently client-side only; RLS still allows reading all `new` leads).
- **Admin business management powers** requested (edit business details, change emails, delete businesses) are **not present in UI**.
- **Auto-expiration scheduling** is not configured in code (requires pg_cron / Supabase scheduler setup).
- **Security hardening for admin-only RPC functions** (current `SECURITY DEFINER` + broad grants are likely too permissive for `expire_lead` and analytics).
