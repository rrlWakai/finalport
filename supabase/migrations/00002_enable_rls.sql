-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Enables Row-Level Security on all tables
-- Anon: INSERT only into consultations, leads, activity_logs (for the public scheduler form)
-- Authenticated: full CRUD on all tables
--
-- IMPORTANT: Drop existing policies first (idempotent rerun)

-- 1. Enable RLS on all tables
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to clean slate
DROP POLICY IF EXISTS "anon_insert_consultations" ON consultations;
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
DROP POLICY IF EXISTS "anon_insert_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "anon_select_consultations" ON consultations;
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
DROP POLICY IF EXISTS "anon_select_messages" ON messages;
DROP POLICY IF EXISTS "anon_select_availability" ON availability;
DROP POLICY IF EXISTS "anon_select_blocked_dates" ON blocked_dates;
DROP POLICY IF EXISTS "anon_select_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "anon_select_email_templates" ON email_templates;
DROP POLICY IF EXISTS "auth_all_consultations" ON consultations;
DROP POLICY IF EXISTS "auth_all_leads" ON leads;
DROP POLICY IF EXISTS "auth_all_messages" ON messages;
DROP POLICY IF EXISTS "auth_all_availability" ON availability;
DROP POLICY IF EXISTS "auth_all_blocked_dates" ON blocked_dates;
DROP POLICY IF EXISTS "auth_all_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "auth_all_email_templates" ON email_templates;
DROP POLICY IF EXISTS "auth_delete_consultations" ON consultations;
DROP POLICY IF EXISTS "auth_delete_leads" ON leads;
DROP POLICY IF EXISTS "auth_delete_messages" ON messages;
DROP POLICY IF EXISTS "auth_delete_availability" ON availability;
DROP POLICY IF EXISTS "auth_delete_blocked_dates" ON blocked_dates;
DROP POLICY IF EXISTS "auth_delete_email_templates" ON email_templates;
DROP POLICY IF EXISTS "auth_delete_activity_logs" ON activity_logs;

-- 3. Anon policies — INSERT only into submission tables (public scheduler form)
--    Anon CANNOT SELECT, UPDATE, or DELETE anything.
CREATE POLICY "anon_insert_consultations" ON consultations
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_leads" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_activity_logs" ON activity_logs
  FOR INSERT TO anon
  WITH CHECK (true);

-- 4. Authenticated admin — full CRUD on all tables
CREATE POLICY "auth_all_consultations" ON consultations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_leads" ON leads
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_messages" ON messages
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_availability" ON availability
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_blocked_dates" ON blocked_dates
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_activity_logs" ON activity_logs
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_email_templates" ON email_templates
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
