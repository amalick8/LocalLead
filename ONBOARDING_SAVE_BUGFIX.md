### LocalLead — Onboarding Save Bugfix (Production)

#### Problem
Business onboarding sometimes fails with **“Failed to save profile”** even though the form is filled out.

#### Root cause
- The onboarding save path wrote onboarding fields using an **UPDATE** against `public.profiles`.
- For many new signups, the `profiles` row **does not exist yet**.
- `UPDATE ... WHERE id = <userId>` matches **0 rows** when the row is missing.
- This results in onboarding not persisting required fields, so onboarding completion fails and the UI shows an error.

---

## Fix

### 1) Replace UPDATE with UPSERT (reliable create-or-update)
- Updated profile save logic to use:
  - `supabase.from('profiles').upsert(..., { onConflict: 'id' })`
- This guarantees:
  - If the row **doesn’t exist** → it is **inserted**
  - If the row **does exist** → it is **updated**

### 2) Ensure required onboarding payload fields are always included
The upsert payload always includes:
- `id` (must equal `auth.user.id` / `auth.uid()`)
- `business_type`
- `service_description`
- `city`
- `state`
- `zip_code`
- `country` (**defaults to `'US'`**)

### 3) Defensive safety checks + better error visibility
- Before saving:
  - Ensure user is authenticated
  - Ensure required fields are present
- On failure:
  - Log with `console.error` (includes the Supabase error)
  - Surface the Supabase error message in the UI toast

---

## Optional schema hardening (safe)
Added a defensive migration to ensure `profiles.country` always has a default:

- Sets default:
  - `ALTER TABLE public.profiles ALTER COLUMN country SET DEFAULT 'US';`
- Backfills any nulls:
  - `UPDATE public.profiles SET country = 'US' WHERE country IS NULL;`
- This migration is safe/idempotent (checks the column exists first).

---

## Files changed
- `src/hooks/useProfile.ts`
  - Replaced `.update(...)` with `.upsert(..., { onConflict: 'id' })`
  - Ensures `country` is set (`'US'` if missing)
  - Logs Supabase errors

- `src/pages/Onboarding.tsx`
  - Authenticated-user check before saving
  - Required-field checks
  - Sends full onboarding payload including `country: 'US'`
  - Logs failures and surfaces the real error message

- `supabase/migrations/20260115000000_ensure_profiles_country_default.sql`
  - Ensures `profiles.country` default `'US'` and backfills nulls

---

## Why this is safe with Supabase + RLS
- UPSERT is executed with the **user session**, so **RLS still applies**.
- RLS policies already allow:
  - **INSERT own profile**: `WITH CHECK (auth.uid() = id)`
  - **UPDATE own profile** (policy exists in schema)
- Since we always write `id: user.id` (which equals `auth.uid()`), users can only create/update **their own** profile row.

---

## Verification flow (expected behavior)
1. New business user signs up
2. Navigates to `/onboarding`
3. Submits the form
4. Profile row is **created or updated** via UPSERT
5. User is redirected to `/dashboard`
6. No “Failed to save profile” error appears
