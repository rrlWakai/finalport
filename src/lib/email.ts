import { supabase } from '../dashboard/lib/supabase';

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ id: string } | null> {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { to, subject, html },
  });
  if (error) throw new Error(error.message || 'Failed to send email');
  return data?.id ? { id: data.id } : null;
}

export async function sendReply(
  to: string,
  subject: string,
  replyHtml: string,
): Promise<{ id: string } | null> {
  return sendEmail(to, `Re: ${subject}`, replyHtml);
}

export function fillTemplate(
  body: string,
  vars: Record<string, string>,
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
