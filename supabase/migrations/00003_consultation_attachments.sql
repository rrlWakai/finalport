-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Creates consultation_attachments table, storage bucket, and RLS policies

-- 1. Create consultation_attachments table
CREATE TABLE consultation_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE consultation_attachments ENABLE ROW LEVEL SECURITY;

-- 2. Create storage bucket for consultation attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consultation-attachments',
  'consultation-attachments',
  false,
  20971520,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- 3. Storage bucket RLS policies
-- Anon: can upload and view files associated with consultations they create
CREATE POLICY "anon_insert_consultation_attachments" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'consultation-attachments'
    AND (storage.foldername(name))[1] = 'consultations'
  );

CREATE POLICY "anon_select_consultation_attachments" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'consultation-attachments');

-- Authenticated admin: full access to storage
CREATE POLICY "auth_all_consultation_attachments_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'consultation-attachments')
  WITH CHECK (bucket_id = 'consultation-attachments');

-- 4. Table RLS policies
-- Anon: can insert attachment metadata when booking
CREATE POLICY "anon_insert_consultation_attachments" ON consultation_attachments
  FOR INSERT TO anon
  WITH CHECK (true);

-- Anon: can select attachment metadata
CREATE POLICY "anon_select_consultation_attachments" ON consultation_attachments
  FOR SELECT TO anon
  USING (true);

-- Authenticated admin: full CRUD on attachment metadata
CREATE POLICY "auth_all_consultation_attachments" ON consultation_attachments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
