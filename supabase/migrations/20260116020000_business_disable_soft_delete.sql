-- ============================================================================
-- Admin business management: soft-disable + soft-delete (profiles) + RLS tighten
-- ============================================================================
-- Adds safe admin-only controls to disable or remove a business from operations
-- without deleting Auth users.
--
-- This migration:
-- 1) Adds columns to public.profiles (idempotent):
--    - is_disabled BOOLEAN NOT NULL DEFAULT false
--    - disabled_at TIMESTAMPTZ NULL
--    - deleted_at TIMESTAMPTZ NULL
-- 2) Tightens business-facing SELECT/INSERT policies so disabled/deleted businesses
--    cannot access leads/payments even if authenticated.
-- 3) Does NOT weaken any admin policies.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_disabled'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN is_disabled BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'disabled_at'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN disabled_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END$$;

COMMENT ON COLUMN public.profiles.is_disabled IS 'Admin-managed flag: disables business operations when true.';
COMMENT ON COLUMN public.profiles.disabled_at IS 'Timestamp when admin disabled business operations.';
COMMENT ON COLUMN public.profiles.deleted_at IS 'Soft-delete timestamp; treated as removed from operations.';

-- ============================================================================
-- RLS tightening: prevent disabled/deleted businesses from reading leads/payments
-- ============================================================================
-- NOTE: We only modify business-facing policies. Admin policies remain unchanged.

-- Leads: purchased leads policy (business users)
DROP POLICY IF EXISTS "Business users can view purchased leads" ON public.leads;
CREATE POLICY "Business users can view purchased leads"
ON public.leads FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.payments
    WHERE payments.lead_id = leads.id
      AND payments.user_id = auth.uid()
      AND payments.status = 'completed'
  )
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND COALESCE(p.is_disabled, false) = false
      AND p.deleted_at IS NULL
  )
);

-- Leads: available leads policy (business users)
DROP POLICY IF EXISTS "Business users can view available leads" ON public.leads;
CREATE POLICY "Business users can view available leads"
ON public.leads FOR SELECT
USING (
  public.has_role(auth.uid(), 'business')
  AND status = 'new'
  -- Must match the business user's profile targeting constraints AND not be disabled/deleted
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.services s
      ON s.id = leads.service_id
     AND s.is_active = true
    WHERE
      p.id = auth.uid()
      AND COALESCE(p.is_disabled, false) = false
      AND p.deleted_at IS NULL
      -- Service match: profile.business_type stores the service name
      AND p.business_type IS NOT NULL
      AND s.name = p.business_type
      -- Location match: city OR zip_code
      AND (
        (
          p.city IS NOT NULL
          AND lower(btrim(leads.city)) = lower(btrim(p.city))
        )
        OR
        (
          p.zip_code IS NOT NULL
          AND leads.zip_code IS NOT NULL
          AND regexp_replace(leads.zip_code, '\\D', '', 'g') = regexp_replace(p.zip_code, '\\D', '', 'g')
        )
      )
  )
);

-- Payments: users can view own payments (disabled/deleted businesses blocked)
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
USING (
  auth.uid() = user_id
  AND (
    -- Admins keep visibility (admin dashboards rely on their own SELECT policies anyway,
    -- but this prevents accidentally blocking an admin who has no profile row).
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND COALESCE(p.is_disabled, false) = false
        AND p.deleted_at IS NULL
    )
  )
);

-- Payments: users can create own payments (disabled/deleted businesses blocked)
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
CREATE POLICY "Users can create own payments"
ON public.payments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.has_role(auth.uid(), 'business')
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND COALESCE(p.is_disabled, false) = false
      AND p.deleted_at IS NULL
  )
);

