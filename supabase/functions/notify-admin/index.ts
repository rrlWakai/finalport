import { createClient } from 'npm:@supabase/supabase-js@2.47.0';
import { Resend } from 'npm:resend@4.2.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_ADDRESS = Deno.env.get('RESEND_FROM') ?? 'onboarding@resend.dev';
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

interface NotifyPayload {
  consultation_id: string;
  conversation_token: string;
  client_name: string;
  property_name: string;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!RESEND_API_KEY || !ADMIN_EMAIL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required environment variables');
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: NotifyPayload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.consultation_id || !body.conversation_token || !body.client_name || !body.property_name || !body.message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();
  const { count: recentCount } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'Admin notification email sent.')
    .eq('entity_id', body.consultation_id)
    .gte('created_at', sixtySecondsAgo);

  if (recentCount && recentCount > 0) {
    return new Response(JSON.stringify({ skipped: true, reason: 'rate_limited' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const conversationUrl = `${SITE_URL}/messages/${body.conversation_token}`;
  const dashboardUrl = `${SITE_URL}/dashboard`;

  const subject = `New Message from ${body.client_name}`;
  const html = `<h2>New Client Message</h2>
<p><strong>Client:</strong> ${escapeHtml(body.client_name)}</p>
<p><strong>Property:</strong> ${escapeHtml(body.property_name)}</p>
<p><strong>Message:</strong></p>
<blockquote>${escapeHtml(body.message)}</blockquote>
<p><a href="${conversationUrl}">Open Conversation</a></p>
<p><a href="${dashboardUrl}">Open Dashboard</a></p>`;

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    if (error) {
      console.error('Resend API error:', error);
      await supabase.from('activity_logs').insert({
        action: 'Admin notification email failed.',
        entity_type: 'consultation',
        entity_id: body.consultation_id,
      });
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await supabase.from('activity_logs').insert({
      action: 'Admin notification email sent.',
      entity_type: 'consultation',
      entity_id: body.consultation_id,
    });

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    await supabase.from('activity_logs').insert({
      action: 'Admin notification email failed.',
      entity_type: 'consultation',
      entity_id: body.consultation_id,
    }).catch(() => {});
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
