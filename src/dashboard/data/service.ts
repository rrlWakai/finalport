import { supabase } from '../lib/supabase';
import type { Consultation, Lead, Message, Availability, ActivityLog, EmailTemplate, BlockedDate, ConsultationAttachment, ConsultationLink } from '../data/schema';

function isConfigured() {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '');
}

// ─── Consultations ───────────────────────────────────────────────────

export async function getConsultations(): Promise<Consultation[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('consultations').select('*')
    .order('consultation_date', { ascending: true })
    .order('consultation_time', { ascending: true });
  return (data ?? []) as unknown as Consultation[];
}

export async function createConsultation(consult: Omit<Consultation, 'id' | 'created_at'>) {
  if (!isConfigured()) return null;
  const { data } = await supabase.from('consultations').insert(consult as never).select().single();
  return (data ?? null) as unknown as Consultation | null;
}

export async function updateConsultation(id: string, updates: Partial<Consultation>) {
  if (!isConfigured()) return;
  await supabase.from('consultations').update(updates as never).eq('id', id);
}

export async function deleteConsultation(id: string) {
  if (!isConfigured()) return;
  const attachments = await getAttachments(id);
  const filePaths = attachments.map((a) => a.file_path);
  if (filePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('consultation-attachments')
      .remove(filePaths);
    if (storageError) throw storageError;
  }
  await supabase.from('consultations').delete().eq('id', id);
}

export async function checkSlotAvailability(date: string, time: string): Promise<boolean> {
  if (!isConfigured()) return true;
  const { count } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('consultation_date', date)
    .eq('consultation_time', time)
    .in('status', ['pending', 'confirmed']);
  return (count ?? 0) === 0;
}

// ─── Leads ───────────────────────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('leads').select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as Lead[];
}

export async function createLead(lead: Omit<Lead, 'id' | 'created_at'>) {
  if (!isConfigured()) return null;
  const { data } = await supabase.from('leads').insert(lead as never).select().single();
  return (data ?? null) as unknown as Lead | null;
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  if (!isConfigured()) return;
  await supabase.from('leads').update(updates as never).eq('id', id);
}

export async function deleteLead(id: string) {
  if (!isConfigured()) return;
  await supabase.from('leads').delete().eq('id', id);
}

// ─── Messages ────────────────────────────────────────────────────────

export async function getMessages(): Promise<Message[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('messages').select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as Message[];
}

export async function createMessage(msg: Omit<Message, 'id' | 'created_at'>) {
  if (!isConfigured()) return null;
  const { data } = await supabase.from('messages').insert(msg as never).select().single();
  return (data ?? null) as unknown as Message | null;
}

export async function updateMessageStatus(id: string, status: Message['status']) {
  if (!isConfigured()) return;
  await supabase.from('messages').update({ status } as never).eq('id', id);
}

export async function deleteMessage(id: string) {
  if (!isConfigured()) return;
  await supabase.from('messages').delete().eq('id', id);
}

// ─── Availability ────────────────────────────────────────────────────

export async function getAvailability(): Promise<Availability[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('availability').select('*')
    .order('day_of_week', { ascending: true });
  return (data ?? []) as unknown as Availability[];
}

export async function updateAvailabilitySlot(id: string, updates: Partial<Availability>) {
  if (!isConfigured()) return;
  await supabase.from('availability').update(updates as never).eq('id', id);
}

export async function createAvailabilitySlot(slot: Omit<Availability, 'id'>) {
  if (!isConfigured()) return null;
  const { data } = await supabase.from('availability').insert(slot as never).select().single();
  return (data ?? null) as unknown as Availability | null;
}

export async function deleteAvailabilitySlot(id: string) {
  if (!isConfigured()) return;
  await supabase.from('availability').delete().eq('id', id);
}

// ─── Blocked Dates ───────────────────────────────────────────────────

export async function getBlockedDates(): Promise<BlockedDate[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('blocked_dates').select('*')
    .order('date', { ascending: true });
  return (data ?? []) as unknown as BlockedDate[];
}

export async function createBlockedDate(block: Omit<BlockedDate, 'id'>) {
  if (!isConfigured()) return null;
  const { data } = await supabase.from('blocked_dates').insert(block as never).select().single();
  return (data ?? null) as unknown as BlockedDate | null;
}

export async function deleteBlockedDate(id: string) {
  if (!isConfigured()) return;
  await supabase.from('blocked_dates').delete().eq('id', id);
}

// ─── Activity Logs ───────────────────────────────────────────────────

export async function getActivityLogs(): Promise<ActivityLog[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('activity_logs').select('*')
    .order('created_at', { ascending: false }).limit(50);
  return (data ?? []) as unknown as ActivityLog[];
}

export async function createActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>) {
  if (!isConfigured()) return;
  await supabase.from('activity_logs').insert(log as never);
}

// ─── Email Templates ─────────────────────────────────────────────────

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('email_templates').select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as EmailTemplate[];
}

export async function createEmailTemplate(tpl: Omit<EmailTemplate, 'id' | 'created_at'>) {
  if (!isConfigured()) return null;
  const { data } = await supabase.from('email_templates').insert(tpl as never).select().single();
  return (data ?? null) as unknown as EmailTemplate | null;
}

export async function updateEmailTemplate(id: string, updates: Partial<EmailTemplate>) {
  if (!isConfigured()) return;
  await supabase.from('email_templates').update(updates as never).eq('id', id);
}

export async function deleteEmailTemplate(id: string) {
  if (!isConfigured()) return;
  await supabase.from('email_templates').delete().eq('id', id);
}

// ─── Consultation Attachments ────────────────────────────────────────

export async function getAttachments(consultationId: string): Promise<ConsultationAttachment[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('consultation_attachments').select('*')
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: true });
  return (data ?? []) as unknown as ConsultationAttachment[];
}

export async function uploadAttachment(
  consultationId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<ConsultationAttachment | null> {
  if (!isConfigured()) return null;
  const ext = file.name.split('.').pop() ?? 'bin';
  const filePath = `consultations/${consultationId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('consultation-attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;
  if (onProgress) onProgress(100);

  const { data: meta, error: metaError } = await supabase
    .from('consultation_attachments')
    .insert({
      consultation_id: consultationId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
    } as never)
    .select()
    .single();

  if (metaError) throw metaError;
  return (meta ?? null) as unknown as ConsultationAttachment | null;
}

export function getAttachmentUrl(filePath: string): string {
  const { data } = supabase.storage.from('consultation-attachments').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteAttachment(attachment: ConsultationAttachment) {
  if (!isConfigured()) return;
  await supabase.storage.from('consultation-attachments').remove([attachment.file_path]);
  await supabase.from('consultation_attachments').delete().eq('id', attachment.id);
}

// ─── Consultation Links ──────────────────────────────────────────────

export async function getConsultationLinks(consultationId: string): Promise<ConsultationLink[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('consultation_links').select('*')
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: true });
  return (data ?? []) as unknown as ConsultationLink[];
}

export async function createConsultationLink(
  consultationId: string,
  url: string,
  label?: string,
): Promise<ConsultationLink | null> {
  if (!isConfigured()) return null;
  const { data } = await supabase.from('consultation_links').insert({
    consultation_id: consultationId,
    url,
    label: label ?? '',
  } as never).select().single();
  return (data ?? null) as unknown as ConsultationLink | null;
}

export async function deleteConsultationLink(id: string) {
  if (!isConfigured()) return;
  await supabase.from('consultation_links').delete().eq('id', id);
}

// ─── Rate Limiting ───────────────────────────────────────────────────

const RATE_LIMIT_KEY = 'rl_consultation_submissions';

export function checkRateLimit(): { allowed: boolean; message?: string } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const recentHour = timestamps.filter((t) => now - t < oneHour);
    const recentDay = timestamps.filter((t) => now - t < oneDay);

    if (recentHour.length >= 3) {
      return { allowed: false, message: 'Too many consultation requests. Please try again later.' };
    }
    if (recentDay.length >= 10) {
      return { allowed: false, message: 'Too many consultation requests. Please try again later.' };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordSubmission() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    timestamps.push(Date.now());
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
  } catch {
    // silent
  }
}

// ─── Pagination Helpers ──────────────────────────────────────────────

export async function getConsultationsPage(page: number, pageSize = 20): Promise<{ data: Consultation[]; count: number }> {
  if (!isConfigured()) return { data: [], count: 0 };
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase.from('consultations').select('*', { count: 'exact' })
    .order('consultation_date', { ascending: true })
    .order('consultation_time', { ascending: true })
    .range(from, to);
  return { data: (data ?? []) as unknown as Consultation[], count: count ?? 0 };
}

export async function getLeadsPage(page: number, pageSize = 20): Promise<{ data: Lead[]; count: number }> {
  if (!isConfigured()) return { data: [], count: 0 };
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase.from('leads').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  return { data: (data ?? []) as unknown as Lead[], count: count ?? 0 };
}

export async function getMessagesPage(page: number, pageSize = 20): Promise<{ data: Message[]; count: number }> {
  if (!isConfigured()) return { data: [], count: 0 };
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase.from('messages').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  return { data: (data ?? []) as unknown as Message[], count: count ?? 0 };
}

// ─── Realtime Subscriptions ──────────────────────────────────────────

let _channelSeq = 0;

export function subscribeToTable(
  table: string,
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE',
  callback: (payload: Record<string, unknown>) => void,
) {
  if (!isConfigured()) return () => {};
  const id = ++_channelSeq;
  const channel = supabase.channel(`${table}-changes-${id}`)
    .on('postgres_changes' as never,
      { event, schema: 'public', table } as never,
      (payload: unknown) => callback(payload as Record<string, unknown>),
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

type TableCallbacks = {
  onInsert?: (payload: Record<string, unknown>) => void;
  onUpdate?: (payload: Record<string, unknown>) => void;
  onDelete?: (payload: Record<string, unknown>) => void;
};

export function subscribeToTableChanges(
  table: string,
  callbacks: TableCallbacks,
) {
  if (!isConfigured()) return () => {};
  const id = ++_channelSeq;
  const channel = supabase.channel(`${table}-changes-${id}`);

  if (callbacks.onInsert) {
    channel.on('postgres_changes' as never,
      { event: 'INSERT', schema: 'public', table } as never,
      (payload: unknown) => callbacks.onInsert!(payload as Record<string, unknown>),
    );
  }
  if (callbacks.onUpdate) {
    channel.on('postgres_changes' as never,
      { event: 'UPDATE', schema: 'public', table } as never,
      (payload: unknown) => callbacks.onUpdate!(payload as Record<string, unknown>),
    );
  }
  if (callbacks.onDelete) {
    channel.on('postgres_changes' as never,
      { event: 'DELETE', schema: 'public', table } as never,
      (payload: unknown) => callbacks.onDelete!(payload as Record<string, unknown>),
    );
  }

  channel.subscribe();
  return () => supabase.removeChannel(channel);
}
