-- ============================================================================
-- LocalLead Production Database Schema
-- ============================================================================
-- This migration creates the complete database schema for LocalLead.
-- It includes tables, enums, RLS policies, triggers, and helper functions.
--
-- Architecture:
-- - Homeowners submit leads anonymously (no auth required)
-- - Businesses sign up and purchase leads
-- - Admins can manage everything
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles in the system
-- User roles in the system
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'app_role'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('business', 'admin');
  END IF;
END$$;

-- Contact preference for leads
CREATE TYPE public.contact_preference AS ENUM ('phone', 'email');

-- Lead status lifecycle
CREATE TYPE public.lead_status AS ENUM ('new', 'purchased', 'expired');

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- Stores user profile information linked to Supabase Auth users
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase Auth. Created automatically on signup.';
COMMENT ON COLUMN public.profiles.business_name IS 'Business name for business users. Can be set during signup via metadata.';

-- ----------------------------------------------------------------------------
-- user_roles
-- Role-based access control. One role per user (business by default).
-- ----------------------------------------------------------------------------
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

COMMENT ON TABLE public.user_roles IS 'Role assignments for users. Default role is business, assigned on signup.';
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- ----------------------------------------------------------------------------
-- services
-- Service categories that leads can be submitted for
-- ----------------------------------------------------------------------------
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 500,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.services IS 'Service categories available for lead submission. Public read access for active services.';
CREATE INDEX idx_services_is_active ON public.services(is_active) WHERE is_active = true;

-- ----------------------------------------------------------------------------
-- leads
-- Service requests submitted by homeowners (can be anonymous)
-- ----------------------------------------------------------------------------
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT NOT NULL,
  zip_code TEXT,
  description TEXT NOT NULL,
  contact_preference public.contact_preference NOT NULL DEFAULT 'email',
  status public.lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.leads IS 'Service requests from homeowners. Anyone can create, but only businesses/admins can read.';
COMMENT ON COLUMN public.leads.status IS 'Lead lifecycle: new -> purchased (when business buys) -> expired (optional future feature)';
CREATE INDEX idx_leads_service_id ON public.leads(service_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- ----------------------------------------------------------------------------
-- payments
-- Tracks lead purchases by businesses
-- ----------------------------------------------------------------------------
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lead_id)
);

COMMENT ON TABLE public.payments IS 'Tracks lead purchases. One payment per user per lead. Status typically completed after purchase.';
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_lead_id ON public.payments(lead_id);
CREATE INDEX idx_payments_user_status ON public.payments(user_id, status) WHERE status = 'completed';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- has_role(user_id, role)
-- Checks if a user has a specific role. Used in RLS policies.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
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

COMMENT ON FUNCTION public.has_role IS 'Security definer function to check if a user has a specific role. Used in RLS policies.';

-- ----------------------------------------------------------------------------
-- update_updated_at_column()
-- Generic trigger function to update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column IS 'Trigger function to automatically update updated_at timestamp on row updates.';

-- ----------------------------------------------------------------------------
-- handle_new_user()
-- Creates profile and assigns business role when a new user signs up
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  business_name_text TEXT;
BEGIN
  -- Extract business_name from user metadata if provided
  business_name_text := COALESCE((NEW.raw_user_meta_data->>'business_name')::TEXT, NULL);
  
  -- Create profile (idempotent with ON CONFLICT)
  INSERT INTO public.profiles (id, email, business_name)
  VALUES (NEW.id, NEW.email, business_name_text)
  ON CONFLICT (id) DO UPDATE SET
    business_name = COALESCE(EXCLUDED.business_name, profiles.business_name);
  
  -- Assign business role by default (idempotent)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'business')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Trigger function that creates profile and assigns business role on user signup. Extracts business_name from metadata if provided.';

-- ----------------------------------------------------------------------------
-- validate_lead_purchase()
-- Ensures a lead cannot be marked as purchased without a completed payment
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_lead_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only validate when status changes to 'purchased'
  IF NEW.status = 'purchased' AND OLD.status = 'new' THEN
    -- Check if a completed payment exists for this lead
    IF NOT EXISTS (
      SELECT 1 
      FROM public.payments
      WHERE lead_id = NEW.id
        AND status = 'completed'
    ) THEN
      RAISE EXCEPTION 'Lead cannot be marked as purchased without a completed payment';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.validate_lead_purchase IS 'Prevents leads from being marked as purchased without a corresponding completed payment.';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile and role on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update timestamps
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Validate lead purchase
CREATE TRIGGER check_lead_purchase
  BEFORE UPDATE OF status ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lead_purchase();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------------------
-- user_roles policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------------------
-- services policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------------------
-- leads policies
-- ----------------------------------------------------------------------------
-- Anonymous users can create leads
CREATE POLICY "Anyone can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- Admins can see everything
CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Business users can see leads they purchased (full details)
CREATE POLICY "Business users can view purchased leads"
  ON public.leads FOR SELECT
  USING (
    public.has_role(auth.uid(), 'business') AND
    EXISTS (
      SELECT 1
      FROM public.payments
      WHERE payments.lead_id = leads.id
        AND payments.user_id = auth.uid()
        AND payments.status = 'completed'
    )
  );

-- Business users can see available leads (status = 'new')
-- Note: Frontend handles hiding email/phone until purchase
CREATE POLICY "Business users can view available leads"
  ON public.leads FOR SELECT
  USING (
    public.has_role(auth.uid(), 'business') AND
    status = 'new'
  );

-- Admins can update leads
CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------------------
-- payments policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default services (idempotent - only inserts if table is empty)
-- This ensures services exist even on a fresh database
DO $$
BEGIN
  -- Only insert if services table is empty
  IF NOT EXISTS (SELECT 1 FROM public.services LIMIT 1) THEN
    INSERT INTO public.services (name, description, price_cents, is_active) VALUES
      ('Plumbing', 'Plumbing repairs and installation', 2000, true),
      ('Electrical', 'Electrical services and repairs', 2000, true),
      ('HVAC', 'Heating and cooling services', 2500, true),
      ('Home Cleaning', 'Residential cleaning services', 1000, true),
      ('Handyman', 'General home repairs and maintenance', 1000, true),
      ('Landscaping', 'Lawn care and landscaping', 1500, true)
    ON CONFLICT (name) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Ensure authenticated users can use the has_role function
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO anon;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
