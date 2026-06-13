CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  project_type TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_range TEXT,
  preferred_date DATE,
  preferred_time TIME,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  meeting_link TEXT,
  scheduled_at TIMESTAMP,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON appointments
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated all" ON appointments
  FOR ALL TO authenticated
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
