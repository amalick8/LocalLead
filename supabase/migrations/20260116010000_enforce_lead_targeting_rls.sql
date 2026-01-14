-- ============================================================================
-- Enforce server-side lead targeting for business users (RLS)
-- ============================================================================
-- Problem:
-- - Frontend filters leads by business profile (service + city/zip), but RLS
--   previously allowed business users to SELECT all leads with status = 'new'.
-- - This is unsafe because clients can bypass UI filters and query directly.
--
-- Goal:
-- Business users may only read leads where:
-- - leads.status = 'new'
-- - leads.service_id matches their business profile business_type (service name)
-- - AND (leads.city OR leads.zip_code matches their profile)
--
-- Notes:
-- - Admin access remains unchanged (Admins can view all leads policy).
-- - Purchased-leads access remains unchanged (Business users can view purchased leads policy).
-- - This migration updates ONLY the available-leads SELECT policy for business users.
-- ============================================================================

-- Replace the existing broad policy with a targeted one
DROP POLICY IF EXISTS "Business users can view available leads" ON public.leads;

CREATE POLICY "Business users can view available leads"
ON public.leads FOR SELECT
USING (
  -- Must be a business user
  public.has_role(auth.uid(), 'business')
  -- Only available inventory
  AND status = 'new'
  -- Must match the business user's profile targeting constraints
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.services s
      ON s.id = leads.service_id
     AND s.is_active = true
    WHERE
      p.id = auth.uid()
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

COMMENT ON POLICY "Business users can view available leads" ON public.leads IS
'Business users may only view NEW leads that match their profile targeting: service matches profiles.business_type (service name) and (city OR zip_code) matches.';

