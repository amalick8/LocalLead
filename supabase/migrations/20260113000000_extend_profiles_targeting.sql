-- ============================================================================
-- Extend profiles table for richer business targeting
-- ============================================================================
-- Adds location and business type fields to support better lead matching
-- 
-- New columns:
-- - business_type: TEXT (can reference service name or be custom text)
-- - service_description: TEXT (detailed description of services offered)
-- - city: TEXT (business location city)
-- - state: TEXT (business location state)
-- - zip_code: TEXT (business location zip code)
-- - country: TEXT (default 'US')
-- ============================================================================

-- Add new columns to profiles table (idempotent - uses IF NOT EXISTS check)
DO $$
BEGIN
  -- business_type: Can reference a service name or be custom text
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'business_type'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN business_type TEXT;
  END IF;

  -- service_description: Detailed description of services offered
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'service_description'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN service_description TEXT;
  END IF;

  -- city: Business location city
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'city'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
  END IF;

  -- state: Business location state
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'state'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN state TEXT;
  END IF;

  -- zip_code: Business location zip code
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN zip_code TEXT;
  END IF;

  -- country: Business location country (default 'US')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'country'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN country TEXT NOT NULL DEFAULT 'US';
  END IF;
END$$;

-- Add column comments
COMMENT ON COLUMN public.profiles.business_type IS 'Business type - can reference a service name from services table or be custom text';
COMMENT ON COLUMN public.profiles.service_description IS 'Detailed description of services offered by the business';
COMMENT ON COLUMN public.profiles.city IS 'Business location city';
COMMENT ON COLUMN public.profiles.state IS 'Business location state';
COMMENT ON COLUMN public.profiles.zip_code IS 'Business location zip code';
COMMENT ON COLUMN public.profiles.country IS 'Business location country (default: US)';

-- ============================================================================
-- Ensure admin can update all profiles (if policy doesn't exist)
-- ============================================================================

-- Drop existing admin update policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create admin update policy
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- Verify RLS policies
-- ============================================================================
-- Existing policies that remain valid:
-- 1. "Users can view own profile" - SELECT using (auth.uid() = id) ✅
-- 2. "Users can update own profile" - UPDATE using (auth.uid() = id) ✅
-- 3. "Users can insert own profile" - INSERT with CHECK (auth.uid() = id) ✅
-- 4. "Admins can view all profiles" - SELECT using has_role('admin') ✅
-- 5. "Admins can update all profiles" - UPDATE using has_role('admin') ✅ (NEW)
--
-- Result:
-- - Business users can edit their own profile (including new columns) ✅
-- - Admins can view and edit all profiles (including new columns) ✅
