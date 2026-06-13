CREATE TABLE consultation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  label TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE consultation_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_consultation_links" ON consultation_links
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_consultation_links" ON consultation_links
  FOR SELECT TO anon USING (true);

CREATE POLICY "auth_all_consultation_links" ON consultation_links
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
