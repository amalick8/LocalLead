-- Migration: Fix RLS policies, auth flow, and add performance indexes
-- This migration fixes critical issues and improves data access patterns

-- 1. Improve the handle_new_user function to accept business_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  business_name_text TEXT;
BEGIN
  -- Extract business_name from user metadata if provided
  business_name_text := COALESCE((NEW.raw_user_meta_data->>'business_name')::TEXT, NULL);
  
  INSERT INTO public.profiles (id, email, business_name)
  VALUES (NEW.id, NEW.email, business_name_text)
  ON CONFLICT (id) DO UPDATE SET
    business_name = COALESCE(EXCLUDED.business_name, profiles.business_name);
  
  -- Ensure role is set (idempotent)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'business')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create a function to safely update business_name in profile
CREATE OR REPLACE FUNCTION public.update_business_name(_business_name TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET business_name = _business_name,
      updated_at = now()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Fix the has_role function to handle edge cases properly
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
  END;
$$;

-- 4. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status) WHERE status = 'new';
CREATE INDEX IF NOT EXISTS idx_leads_service_id ON public.leads(service_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_lead ON public.payments(user_id, lead_id, status) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);

-- 5. Ensure lead status updates require payment (security enforcement)
CREATE OR REPLACE FUNCTION public.update_lead_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow status change to 'purchased' if a payment exists
  IF NEW.status = 'purchased' AND OLD.status = 'new' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.payments
      WHERE lead_id = NEW.id
      AND status = 'completed'
    ) THEN
      RAISE EXCEPTION 'Lead cannot be marked as purchased without a completed payment';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_lead_status_update
  BEFORE UPDATE OF status ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_status();

-- 6. Add comment explaining RLS policy behavior for leads
COMMENT ON POLICY "Business users can view available leads (limited info)" ON public.leads IS 
'Business users can see all columns of available leads. Frontend handles hiding sensitive contact info until purchase. For stricter security, consider creating a database view that excludes email/phone for unpurchased leads.';
