import { supabase } from '../dashboard/lib/supabase';

interface NewMessageNotification {
  consultation_id: string;
  conversation_token: string;
  client_name: string;
  property_name: string;
  message: string;
}

export async function notifyAdminNewMessage(params: NewMessageNotification): Promise<void> {
  try {
    await supabase.functions.invoke('notify-admin', { body: params });
  } catch {
    // Failures must never break messaging
  }
}

export async function notifyAdminNewLead(lead: { name: string; property_name: string; email: string }): Promise<void> {
  try {
    await supabase.functions.invoke('notify-admin', {
      body: {
        type: 'new_lead',
        client_name: lead.name,
        property_name: lead.property_name,
        message: `New lead from ${lead.name} (${lead.email})`,
        consultation_id: '',
        conversation_token: '',
      },
    });
  } catch {
    // silent
  }
}
