-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Creates all tables for the Consultation CRM Dashboard

-- 1. Consultations
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  property_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  consultation_date DATE NOT NULL,
  consultation_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  property_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT DEFAULT '',
  challenge TEXT DEFAULT '',
  budget TEXT DEFAULT '',
  source TEXT DEFAULT '',
  stage TEXT NOT NULL CHECK (stage IN ('new_inquiry', 'discovery_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost')) DEFAULT 'new_inquiry',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unread', 'read', 'archived', 'resolved')) DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Availability
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  is_available BOOLEAN DEFAULT true
);

-- 5. Blocked Dates
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  reason TEXT DEFAULT ''
);

-- 6. Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Activity Logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime for activity_logs
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Insert default availability (Mon-Fri 9AM-5PM, weekends off)
INSERT INTO availability (day_of_week, start_time, end_time, is_available) VALUES
  (0, '', '', false),
  (1, '09:00', '17:00', true),
  (2, '09:00', '17:00', true),
  (3, '09:00', '15:00', true),
  (4, '09:00', '17:00', true),
  (5, '09:00', '17:00', true),
  (6, '', '', false);

-- Insert seed consultations
INSERT INTO consultations (name, property_name, email, phone, consultation_date, consultation_time, status, notes) VALUES
  ('Maria Santos', 'Bluewater Beach Resort', 'maria@bluewater.com', '+63 912 345 6789', CURRENT_DATE, '10:00 AM', 'confirmed', 'Interested in building a complete direct-booking website with payment integration.'),
  ('Juan Reyes', 'Villa Amihan', 'juan@villaamihan.com', '+63 923 456 7890', CURRENT_DATE, '11:30 AM', 'pending', 'Small boutique resort looking to reduce OTA commissions.'),
  ('Carla Dimagiba', 'Palm Paradise Resort', 'carla@palmparadise.com', '+63 934 567 8901', CURRENT_DATE, '2:00 PM', 'confirmed', 'Follow-up on proposal sent last week. Ready to move forward.'),
  ('Dennis Tan', 'Mountain View Resort', 'dennis@mtnview.com', '+63 945 678 9012', CURRENT_DATE, '4:00 PM', 'confirmed', 'Project presentation for full booking system with multi-property support.');

-- Insert seed leads
INSERT INTO leads (name, property_name, email, phone, location, challenge, budget, source, stage, notes) VALUES
  ('Maria Santos', 'Bluewater Beach Resort', 'maria@bluewater.com', '+63 912 345 6789', 'Boracay, Philippines', 'High OTA commissions and no direct booking channel', '₱150,000 - ₱200,000', 'Referral', 'proposal_sent', 'Very responsive. Likely to close this month.'),
  ('Juan Reyes', 'Villa Amihan', 'juan@villaamihan.com', '+63 923 456 7890', 'Batangas, Philippines', 'Manual reservation management causing double-bookings', '₱80,000 - ₱120,000', 'Website', 'discovery_scheduled', 'Small property but high potential for referrals.'),
  ('Carla Dimagiba', 'Palm Paradise Resort', 'carla@palmparadise.com', '+63 934 567 8901', 'Palawan, Philippines', 'No online payment system, guests must call to book', '₱200,000 - ₱300,000', 'LinkedIn', 'negotiation', 'Reviewing contract terms. Wants multi-property support.'),
  ('Dennis Tan', 'Mountain View Resort', 'dennis@mtnview.com', '+63 945 678 9012', 'Tagaytay, Philippines', 'Needs complete online presence with booking engine', '₱250,000 - ₱350,000', 'Google Search', 'proposal_sent', 'Comparing proposals. Need to follow up this week.');

-- Insert seed activity
INSERT INTO activity_logs (action, entity_type, entity_id) VALUES
  ('New consultation booked', 'consultation', 'seed-1'),
  ('Proposal sent to Bluewater Beach Resort', 'lead', 'seed-2'),
  ('Lead moved to proposal stage - Mountain View Resort', 'lead', 'seed-3');
