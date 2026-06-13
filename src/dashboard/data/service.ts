import { supabase } from '../lib/supabase';
import type { Appointment, Lead, Availability, ActivityLog, EmailTemplate, BlockedDate } from '../data/schema';

function isConfigured() {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '');
}

// ─── Appointments ───────────────────────────────────────────────────

export async function getAppointments(): Promise<Appointment[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('appointments').select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as Appointment[];
}

export async function getAppointmentsPage(page: number, pageSize = 20): Promise<{ data: Appointment[]; count: number }> {
  if (!isConfigured()) return { data: [], count: 0 };
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase.from('appointments').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  return { data: (data ?? []) as unknown as Appointment[], count: count ?? 0 };
}

export async function createAppointment(appt: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
  if (!isConfigured()) return null;
  const { data } = await supabase.from('appointments').insert(appt as never).select().single();
  return (data ?? null) as unknown as Appointment | null;
}

export async function updateAppointment(id: string, updates: Partial<Appointment>) {
  if (!isConfigured()) return;
  await supabase.from('appointments').update({ ...updates, updated_at: new Date().toISOString() } as never).eq('id', id);
}

export async function deleteAppointment(id: string) {
  if (!isConfigured()) return;
  await supabase.from('appointments').delete().eq('id', id);
}

// ─── Leads ───────────────────────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
  if (!isConfigured()) return [];
  const { data } = await supabase.from('leads').select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as Lead[];
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

// ─── Rate Limiting ───────────────────────────────────────────────────

const RATE_LIMIT_KEY = 'rl_appointment_submissions';

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
      return { allowed: false, message: 'Too many requests. Please try again later.' };
    }
    if (recentDay.length >= 10) {
      return { allowed: false, message: 'Too many requests. Please try again later.' };
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
