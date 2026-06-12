export interface Consultation {
  id: string;
  name: string;
  property_name: string;
  email: string;
  phone: string;
  consultation_date: string;
  consultation_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  property_name: string;
  email: string;
  phone: string;
  location: string;
  challenge: string;
  budget: string;
  source: string;
  stage: 'new_inquiry' | 'discovery_scheduled' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  notes: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived' | 'resolved';
  created_at: string;
}

export interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
}

export interface ConsultationAttachment {
  id: string;
  consultation_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
  avatar_url: string;
}

export type Database = {
  public: {
    Tables: {
      consultations: { Row: Consultation };
      leads: { Row: Lead };
      messages: { Row: Message };
      availability: { Row: Availability };
      activity_logs: { Row: ActivityLog };
      blocked_dates: { Row: BlockedDate };
      email_templates: { Row: EmailTemplate };
      consultation_attachments: { Row: ConsultationAttachment };
    };
  };
};

export const STAGE_LABELS: Record<Lead['stage'], string> = {
  new_inquiry: 'New Inquiry',
  discovery_scheduled: 'Discovery Scheduled',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const STAGE_COLORS: Record<Lead['stage'], string> = {
  new_inquiry: 'bg-blue-100 text-blue-800',
  discovery_scheduled: 'bg-amber-100 text-amber-800',
  proposal_sent: 'bg-violet-100 text-violet-800',
  negotiation: 'bg-orange-100 text-orange-800',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-neutral-100 text-neutral-500',
};

export const CONSULTATION_STATUS_LABELS: Record<Consultation['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export const CONSULTATION_STATUS_COLORS: Record<Consultation['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-neutral-100 text-neutral-500',
  no_show: 'bg-red-100 text-red-800',
};

export const MESSAGE_STATUS_LABELS: Record<Message['status'], string> = {
  unread: 'Unread',
  read: 'Read',
  archived: 'Archived',
  resolved: 'Resolved',
};

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
