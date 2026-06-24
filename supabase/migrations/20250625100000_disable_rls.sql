-- App-level auth only (Next.js API routes + secret key).
-- No Supabase RLS policies — all access is server-side via SUPABASE_SERVICE_ROLE_KEY.

ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS billing_customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usage_counters DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wearable_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partner_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wellness_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS otps DISABLE ROW LEVEL SECURITY;

-- Drop any RLS policies if they were added manually in the dashboard
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'users', 'billing_customers', 'subscriptions', 'payments',
        'usage_counters', 'wearable_devices', 'partner_invites',
        'wellness_reports', 'otps'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;
