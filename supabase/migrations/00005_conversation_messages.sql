-- Add conversation_token to consultations
ALTER TABLE consultations
ADD COLUMN conversation_token UUID
DEFAULT gen_random_uuid()
UNIQUE;

-- Create conversation_messages table
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
  sender_name TEXT,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_messages_consultation ON conversation_messages(consultation_id);
CREATE INDEX idx_messages_created_at ON conversation_messages(created_at DESC);

-- Enable realtime for conversation_messages
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;

-- RLS policies
-- Client can read messages for their consultation (via token)
CREATE POLICY "client_select_conversation_messages" ON conversation_messages
  FOR SELECT TO anon
  USING (
    consultation_id IN (
      SELECT id FROM consultations WHERE conversation_token IS NOT NULL
    )
  );

-- Client can insert messages for their consultation
CREATE POLICY "client_insert_conversation_messages" ON conversation_messages
  FOR INSERT TO anon
  WITH CHECK (
    sender_type = 'client'
    AND consultation_id IN (
      SELECT id FROM consultations WHERE conversation_token IS NOT NULL
    )
  );

-- Admin full access
CREATE POLICY "auth_all_conversation_messages" ON conversation_messages
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
