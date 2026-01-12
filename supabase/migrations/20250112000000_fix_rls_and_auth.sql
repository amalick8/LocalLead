-- Ensure enum exists before use
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'app_role'
  ) THEN
    CREATE TYPE app_role AS ENUM ('business', 'admin');
  END IF;
END$$;
