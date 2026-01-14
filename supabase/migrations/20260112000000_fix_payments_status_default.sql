-- ============================================================================
-- Fix payments.status default inconsistency
-- ============================================================================
-- Issue: Schema default was 'completed', but actual flow is 'pending' → 'completed'
-- Fix: Change default to 'pending' to match real payment flow
-- 
-- This migration:
-- 1. Changes the default value for payments.status from 'completed' to 'pending'
-- 2. Does NOT modify existing rows (they keep their current status values)
-- 3. Ensures new payments created without explicit status will be 'pending'
-- ============================================================================

-- Change default status to 'pending' (matches actual payment flow)
ALTER TABLE public.payments
  ALTER COLUMN status SET DEFAULT 'pending';

-- Update comment to reflect correct flow
COMMENT ON COLUMN public.payments.status IS 'Payment status: pending (created) → completed (via webhook). Default is pending.';
