-- Add is_premium flag to profiles if it doesn't already exist
-- (may have been added directly via Supabase dashboard)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;

-- Allow Edge Functions (service_role) to read profiles for email dispatch
-- (service_role bypasses RLS by default — no extra policy needed)

-- Optional: index for fast premium-user lookups by send-signal-email
CREATE INDEX IF NOT EXISTS profiles_is_premium_idx ON profiles (is_premium) WHERE is_premium = true;
