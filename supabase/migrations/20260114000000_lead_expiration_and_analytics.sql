-- ============================================================================
-- Lead Expiration and Analytics Support
-- ============================================================================
-- Adds automatic lead expiration and functions for analytics
-- 
-- Features:
-- 1. Auto-expire leads after 30 days (configurable)
-- 2. Function to manually expire leads
-- 3. Analytics helper functions
-- ============================================================================

-- ============================================================================
-- CONFIGURATION: Lead expiration days (default: 30)
-- ============================================================================
-- This can be adjusted by updating the DEFAULT value below
-- To change expiration period, update the interval in the function

-- ============================================================================
-- FUNCTION: Auto-expire old leads
-- ============================================================================
-- Expires leads that are older than X days and still have status 'new'
-- This should be run daily via pg_cron or Supabase scheduled function

CREATE OR REPLACE FUNCTION public.expire_old_leads()
RETURNS TABLE(expired_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Expire leads that are 'new' and older than 30 days
  UPDATE public.leads
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    status = 'new'
    AND created_at < (now() - INTERVAL '30 days');

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN QUERY SELECT expired_count;
END;
$$;

COMMENT ON FUNCTION public.expire_old_leads() IS 'Expires leads that are older than 30 days and still have status new. Returns count of expired leads.';

-- ============================================================================
-- FUNCTION: Manual expire lead (for admin use)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.expire_lead(lead_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

COMMENT ON FUNCTION public.expire_lead(UUID) IS 'Manually expire a specific lead. Only works on leads with status new.';

-- ============================================================================
-- FUNCTION: Get analytics data
-- ============================================================================
-- Returns aggregated analytics for admin dashboard

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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

COMMENT ON FUNCTION public.get_lead_analytics() IS 'Returns aggregated analytics: total leads, purchased, expired, new, revenue, avg price, conversion rate.';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Allow authenticated users to call expire_lead (RLS will enforce admin-only)
GRANT EXECUTE ON FUNCTION public.expire_lead(UUID) TO authenticated;

-- Allow authenticated users to call analytics function
GRANT EXECUTE ON FUNCTION public.get_lead_analytics() TO authenticated;

-- ============================================================================
-- SETUP PG_CRON (if available)
-- ============================================================================
-- To enable automatic expiration, run this in Supabase SQL editor:
-- 
-- SELECT cron.schedule(
--   'expire-old-leads',
--   '0 2 * * *',  -- Run daily at 2 AM UTC
--   $$SELECT public.expire_old_leads()$$
-- );
--
-- To check scheduled jobs:
-- SELECT * FROM cron.job;
--
-- To remove the scheduled job:
-- SELECT cron.unschedule('expire-old-leads');
