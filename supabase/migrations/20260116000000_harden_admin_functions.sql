-- ============================================================================
-- Harden SECURITY DEFINER admin functions (expire_lead, get_lead_analytics)
-- ============================================================================
-- Goal: Ensure only ADMIN users can execute these functions from the app layer.
-- This migration is SAFE and idempotent:
-- - Uses CREATE OR REPLACE FUNCTION
-- - Leaves existing behavior intact for admins
-- - Adds explicit admin checks based on has_role(auth.uid(), 'admin')
-- ============================================================================

-- Ensure only admins can manually expire leads
CREATE OR REPLACE FUNCTION public.expire_lead(lead_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enforce admin-only access at the function level
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'expire_lead is restricted to admin users';
  END IF;

  -- Only expire leads that are 'new' (not already purchased or expired)
  UPDATE public.leads
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    id = lead_id
    AND status = 'new';

  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION public.expire_lead(UUID) IS 'Manually expire a specific lead. Admin-only. Only works on leads with status new.';


-- Ensure only admins can view global lead analytics
CREATE OR REPLACE FUNCTION public.get_lead_analytics()
RETURNS TABLE(
  total_leads BIGINT,
  purchased_leads BIGINT,
  expired_leads BIGINT,
  new_leads BIGINT,
  total_revenue_cents BIGINT,
  avg_lead_price_cents NUMERIC,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enforce admin-only access at the function level
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'get_lead_analytics is restricted to admin users';
  END IF;

  RETURN QUERY
    SELECT 
      COUNT(*)::BIGINT as total_leads,
      COUNT(*) FILTER (WHERE status = 'purchased')::BIGINT as purchased_leads,
      COUNT(*) FILTER (WHERE status = 'expired')::BIGINT as expired_leads,
      COUNT(*) FILTER (WHERE status = 'new')::BIGINT as new_leads,
      COALESCE(SUM(p.amount_cents) FILTER (WHERE p.status = 'completed'), 0)::BIGINT as total_revenue_cents,
      COALESCE(
        AVG(s.price_cents) FILTER (WHERE l.status = 'purchased'),
        0
      )::NUMERIC as avg_lead_price_cents,
      CASE 
        WHEN COUNT(*) > 0 THEN
          ROUND(
            (COUNT(*) FILTER (WHERE status = 'purchased')::NUMERIC / COUNT(*)::NUMERIC) * 100,
            2
          )
        ELSE 0
      END as conversion_rate
    FROM public.leads l
    LEFT JOIN public.payments p ON p.lead_id = l.id AND p.status = 'completed'
    LEFT JOIN public.services s ON s.id = l.service_id;
END;
$$;

COMMENT ON FUNCTION public.get_lead_analytics() IS 'Returns aggregated analytics for admin dashboard. Admin-only: total leads, purchased, expired, new, revenue, avg price, conversion rate.';

-- NOTE:
-- We intentionally do NOT change existing GRANT EXECUTE statements here.
-- They may still grant EXECUTE to `authenticated`, but the internal
-- has_role(auth.uid(), 'admin') check now enforces admin-only behavior
-- even when called through the app with an authenticated session.
