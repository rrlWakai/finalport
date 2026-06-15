-- ============================================================
-- Migration: Unify consultations as single source of truth
-- Drop appointments, add missing columns, fix RLS, add index
-- ============================================================

-- 1. Drop appointments table
DROP TABLE IF EXISTS appointments CASCADE;

-- 2. Add missing columns to consultations (for admin dashboard)
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS project_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS budget_range TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS meeting_link TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Update status CHECK constraint to include approved/rejected
ALTER TABLE consultations
  DROP CONSTRAINT IF EXISTS consultations_status_check;
ALTER TABLE consultations
  ADD CONSTRAINT consultations_status_check
  CHECK (status IN ('pending', 'confirmed', 'approved', 'rejected', 'completed', 'cancelled', 'no_show'));

-- 4. Unique booking index for double-booking protection
DROP INDEX IF EXISTS unique_consultation_slot;
CREATE UNIQUE INDEX unique_consultation_slot
  ON consultations (consultation_date, consultation_time)
  WHERE status IN ('pending', 'confirmed', 'approved');

-- 5. RLS policies — rerunnable via DROP IF EXISTS

-- 5a. consultations
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_consultations" ON consultations;
CREATE POLICY "anon_insert_consultations"
  ON consultations FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_consultations" ON consultations;
CREATE POLICY "auth_all_consultations"
  ON consultations FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5b. leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads"
  ON leads FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_leads" ON leads;
CREATE POLICY "auth_all_leads"
  ON leads FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5c. activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_activity_logs" ON activity_logs;
CREATE POLICY "anon_insert_activity_logs"
  ON activity_logs FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_activity_logs" ON activity_logs;
CREATE POLICY "auth_all_activity_logs"
  ON activity_logs FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5d. availability
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_availability" ON availability;
CREATE POLICY "auth_all_availability"
  ON availability FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5e. blocked_dates
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_blocked_dates" ON blocked_dates;
CREATE POLICY "auth_all_blocked_dates"
  ON blocked_dates FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5f. email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_email_templates" ON email_templates;
CREATE POLICY "auth_all_email_templates"
  ON email_templates FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5g. consultation_attachments
ALTER TABLE consultation_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_consultation_attachments" ON consultation_attachments;
CREATE POLICY "auth_all_consultation_attachments"
  ON consultation_attachments FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5h. consultation_links
ALTER TABLE consultation_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_consultation_links" ON consultation_links;
CREATE POLICY "auth_all_consultation_links"
  ON consultation_links FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5i. conversation_messages (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_messages') THEN
    ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "client_select_conversation_messages" ON conversation_messages;
    CREATE POLICY "client_select_conversation_messages"
      ON conversation_messages FOR SELECT TO anon
      USING (
        consultation_id IN (
          SELECT id FROM consultations WHERE conversation_token IS NOT NULL
        )
      );

    DROP POLICY IF EXISTS "client_insert_conversation_messages" ON conversation_messages;
    CREATE POLICY "client_insert_conversation_messages"
      ON conversation_messages FOR INSERT TO anon
      WITH CHECK (
        sender_type = 'client'
        AND consultation_id IN (
          SELECT id FROM consultations WHERE conversation_token IS NOT NULL
        )
      );

    DROP POLICY IF EXISTS "auth_all_conversation_messages" ON conversation_messages;
    CREATE POLICY "auth_all_conversation_messages"
      ON conversation_messages FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 6. Realtime — safe via DO $$ blocks
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE consultations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 7. Update existing consultations that have no project_type set
UPDATE consultations SET project_type = 'Consultation' WHERE project_type = '';
