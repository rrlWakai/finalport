import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Globe,
  Lightbulb,
  MapPin,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  ArrowLeft,
  Upload,
  X,
  FileText,
  Link2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';
import TurnstileWidget from '../ui/TurnstileWidget';
import { supabase } from '../../dashboard/lib/supabase';
import { useToast } from '../../lib/toast';
import {
  getAvailability as getAvailabilityData,
  getBlockedDates,
  checkSlotAvailability,
  checkRateLimit,
  recordSubmission,
  uploadAttachment,
  createConsultationLink,
} from '../../dashboard/data/service';
import { sendEmail, fillTemplate } from '../../lib/email';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 3;

const PROJECT_TYPES = [
  'Direct Booking Website',
  'Payment Integration',
  'Website Redesign',
  'SEO / Marketing',
  'Multi-Property System',
  'Channel Manager Integration',
  'Other',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIMEZONES = [
  { value: 'Asia/Manila', label: 'Philippine Time (PHT, UTC+8)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZT)' },
];

function generateHourlySlots(start: string, end: string): string[] {
  const parts1 = start.split(':');
  const parts2 = end.split(':');
  const sh = Number(parts1[0]) || 0;
  const sm = Number(parts1[1]) || 0;
  const eh = Number(parts2[0]) || 0;
  const em = Number(parts2[1]) || 0;
  const slots: string[] = [];
  let h = sh;
  let m = sm;
  while (h < eh || (h === eh && m < em)) {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const label = `${hour12}:00 ${period}`;
    if (m === 0) slots.push(label);
    h += 1;
  }
  return slots;
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] } as const,
});

function Calendar({
  selectedDate,
  onSelectDate,
  highlighted,
  blockedDates,
}: {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  highlighted?: boolean;
  blockedDates: string[];
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const selectedStr = selectedDate?.toDateString();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  useEffect(() => {
    if (highlighted) {
      const el = document.querySelector('[data-scheduler]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);

  return (
    <div data-scheduler>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-display-xl text-xs sm:text-sm font-semibold text-on-surface">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] sm:text-label-caps text-on-surface-variant/50 py-0.5 sm:py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const date = new Date(year, month, day);
          const dateStr = date.toDateString();
          const past = date < today;
          const blocked = blockedDates.includes(date.toISOString().split('T')[0] ?? '');

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(date)}
              disabled={past || blocked}
              className={`
                aspect-square rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                ${past || blocked
                  ? 'text-surface-container-highest cursor-not-allowed'
                  : dateStr === selectedStr
                    ? 'bg-primary text-on-primary shadow-md ring-2 ring-primary/30'
                    : 'hover:bg-primary-container/50 text-on-surface active:bg-primary-container/70'
                }
              `}
              aria-label={`Select ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
              aria-selected={dateStr === selectedStr}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeSlotPicker({
  selectedSlot,
  onSelectSlot,
  availableSlots,
  bookedSlots,
  loading,
}: {
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  availableSlots: string[];
  bookedSlots: string[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div>
        <h4 className="font-display-xl text-xs sm:text-sm font-semibold text-on-surface mb-2.5 sm:mb-3">
          Available Times
        </h4>
        <div className="flex items-center justify-center py-8 text-xs text-on-surface-variant/60">
          <Loader2 size={14} className="animate-spin mr-2" /> Loading available slots...
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div>
        <h4 className="font-display-xl text-xs sm:text-sm font-semibold text-on-surface mb-2.5 sm:mb-3">
          Available Times
        </h4>
        <div className="rounded-xl bg-surface-container p-4 text-center">
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            No available consultation times for this date.
          </p>
          <p className="text-[10px] sm:text-xs text-on-surface-variant/60 mt-1">
            Please choose another date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-display-xl text-xs sm:text-sm font-semibold text-on-surface mb-2.5 sm:mb-3">
        Available Times
      </h4>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {availableSlots.map((slot) => {
          const booked = bookedSlots.includes(slot);
          return (
            <button
              key={slot}
              onClick={() => !booked && onSelectSlot(slot)}
              disabled={booked}
              className={`
                py-2.5 sm:py-3 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
                ${booked
                  ? 'bg-surface-container text-on-surface-variant/30 cursor-not-allowed line-through'
                  : selectedSlot === slot
                    ? 'bg-primary text-on-primary shadow-md ring-2 ring-primary/30'
                    : 'bg-surface text-on-surface-variant border border-outline/30 hover:border-primary/50 hover:text-on-surface active:bg-primary-container/70'
                }
              `}
              aria-label={`Select ${slot}${booked ? ' (booked)' : ''}`}
              aria-selected={selectedSlot === slot}
              aria-disabled={booked}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FormField({
  placeholder,
  type = 'text',
  textarea = false,
  value,
  onChange,
  error,
  required,
}: {
  placeholder: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  const base =
    'w-full bg-transparent border-b py-3 sm:py-3.5 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40 font-body-md text-body-md text-on-surface';

  const input = (extra: string) => (
    <div className="relative group">
      {textarea ? (
        <textarea
          placeholder={`${placeholder}${required ? ' *' : ''}`}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} resize-none ${extra} ${error ? 'border-error' : 'border-outline/40'}`}
          aria-required={required}
          aria-invalid={!!error}
        />
      ) : (
        <input
          type={type}
          placeholder={`${placeholder}${required ? ' *' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} ${extra} ${error ? 'border-error' : 'border-outline/40'}`}
          aria-required={required}
          aria-invalid={!!error}
        />
      )}
      <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-focus-within:w-full transition-all duration-500 ${error ? 'bg-error w-full' : 'bg-primary'}`} />
      {error && (
        <p className="text-[10px] text-error mt-1">{error}</p>
      )}
    </div>
  );

  return input('');
}

export function Contact() {
  const { addToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Manila',
  );
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    description: '',
    project_type: '',
    budget_range: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [blockedDateStrs, setBlockedDateStrs] = useState<string[]>([]);
  const [isConfigured, setIsConfigured] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [links, setLinks] = useState<{ url: string; label: string }[]>([]);
  const [pendingLinkUrl, setPendingLinkUrl] = useState('');
  const [pendingLinkLabel, setPendingLinkLabel] = useState('');
  const [linkError, setLinkError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const useTurnstile = !!turnstileSiteKey;

  const step = selectedDate && selectedSlot ? 2 : 1;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#contact' || hash === '#schedule') {
      setHighlight(true);
    }
  }, []);

  useEffect(() => {
    const configured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    setIsConfigured(configured);
    if (!configured) {
      setConfigError(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!isConfigured) return;
      try {
        const blocked = await getBlockedDates();
        setBlockedDateStrs(blocked.map((b) => b.date));
      } catch {
        // silent
      }
    })();
  }, [isConfigured]);

  useEffect(() => {
    if (!selectedDate || !isConfigured) {
      setAvailableSlots([]);
      setBookedSlots([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setSlotsLoading(true);
      try {
        const dayOfWeek = selectedDate.getDay();
        const availability = await getAvailabilityData();
        const dayAvail = availability.find((a) => a.day_of_week === dayOfWeek);
        if (!dayAvail || !dayAvail.is_available) {
          if (!cancelled) { setAvailableSlots([]); setBookedSlots([]); }
          return;
        }

        const allSlots = generateHourlySlots(dayAvail.start_time, dayAvail.end_time);

        const dateStr = selectedDate.toISOString().split('T')[0] ?? '';

        const { data: existing } = await supabase
          .from('consultations')
          .select('consultation_time')
          .eq('consultation_date', dateStr)
          .in('status', ['pending', 'confirmed']);

        const bookedTimes = new Set((existing ?? []).map((r) => r.consultation_time));
        const freeSlots = allSlots.filter((s) => !bookedTimes.has(s));
        const takenSlots = allSlots.filter((s) => bookedTimes.has(s));

        if (!cancelled) {
          setBookedSlots(takenSlots);
          setAvailableSlots(freeSlots);
        }
      } catch {
        if (!cancelled) { setAvailableSlots([]); setBookedSlots([]); }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedDate, isConfigured]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.project_type) e.project_type = 'Please select a project type';
    if (!form.description.trim()) e.description = 'Please describe your project';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const combined = [...files, ...selected].slice(0, MAX_FILES);
    const valid = combined.filter((f) => {
      if (!ALLOWED_FILE_TYPES.includes(f.type)) {
        addToast(`"${f.name}" has an unsupported file type.`, 'error');
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        addToast(`"${f.name}" exceeds the 20 MB limit.`, 'error');
        return false;
      }
      return true;
    });
    setFiles(valid);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  function isValidUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function detectPlatform(url: string): string | null {
    try {
      const host = new URL(url).hostname;
      if (host.includes('drive.google.com')) return 'Google Drive';
      if (host.includes('figma.com')) return 'Figma';
      if (host.includes('dropbox.com')) return 'Dropbox';
      if (host.includes('facebook.com') || host.includes('fb.com')) return 'Facebook';
      if (host.includes('airbnb.com')) return 'Airbnb';
      if (host.includes('booking.com')) return 'Booking.com';
      if (host.includes('docs.google.com') || host.includes('notion')) return 'Document';
      if (host.includes('google')) return 'Google';
      return null;
    } catch {
      return null;
    }
  }

  function platformBadge(url: string): { icon: string; label: string } {
    const platform = detectPlatform(url);
    switch (platform) {
      case 'Google Drive': return { icon: '📁', label: 'Google Drive' };
      case 'Figma': return { icon: '🎨', label: 'Figma' };
      case 'Dropbox': return { icon: '📦', label: 'Dropbox' };
      case 'Facebook': return { icon: '👍', label: 'Facebook' };
      case 'Airbnb': return { icon: '🏠', label: 'Airbnb' };
      case 'Booking.com': return { icon: '🏨', label: 'Booking.com' };
      case 'Document': return { icon: '📄', label: 'Document' };
      case 'Google': return { icon: '🔗', label: 'Google' };
      default: return { icon: '🌐', label: 'Website' };
    }
  }

  const addLink = () => {
    const url = pendingLinkUrl.trim();
    if (!url) { setLinkError('Please enter a URL.'); return; }
    if (!isValidUrl(url)) { setLinkError('Please enter a valid URL (starting with http:// or https://).'); return; }
    if (links.length >= 10) { setLinkError('Maximum of 10 links allowed.'); return; }
    setLinkError('');
    setLinks((prev) => [...prev, { url, label: pendingLinkLabel.trim() }]);
    setPendingLinkUrl('');
    setPendingLinkLabel('');
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    const honeypot = (event.target as HTMLFormElement).website?.value;
    if (honeypot) return;

    if (!validate()) return;
    if (!selectedDate || !selectedSlot) return;

    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      addToast(rateCheck.message ?? 'Too many requests. Please try again later.', 'error');
      return;
    }

    if (useTurnstile && !turnstileToken) {
      addToast('Please complete the security verification.', 'error');
      return;
    }

    setSubmitting(true);
    setUploading(files.length > 0);

    try {
      if (!isConfigured) {
        setConfigError(true);
        addToast('Supabase is not configured. Booking cannot be saved.', 'error');
        return;
      }

      const consultationDate = selectedDate.toISOString().split('T')[0] ?? '';

      const available = await checkSlotAvailability(consultationDate, selectedSlot);
      if (!available) {
        addToast('This time slot has just been booked. Please choose another.', 'error');
        setSelectedSlot(null);
        return;
      }

      const consultResult = await supabase
        .from('consultations')
        .insert({
          name: form.name.trim(),
          property_name: form.company.trim() || form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          consultation_date: consultationDate,
          consultation_time: selectedSlot,
          status: 'pending',
          notes: form.description.trim(),
        } as never)
        .select()
        .single();

      if (consultResult.error) throw consultResult.error;
      const newConsultation = consultResult.data as { id: string; conversation_token: string } | null;
      const consultationId = newConsultation?.id ?? '';
      const conversationToken = newConsultation?.conversation_token ?? '';

      if (files.length > 0 && consultationId) {
        for (const file of files) {
          const result = await uploadAttachment(consultationId, file);
          if (!result) throw new Error(`Failed to upload ${file.name}`);
        }
      }

      if (links.length > 0 && consultationId) {
        let linkCount = 0;
        for (const link of links) {
          const result = await createConsultationLink(consultationId, link.url, link.label);
          if (result) linkCount++;
        }
        await supabase.from('activity_logs').insert({
          action: `Added ${linkCount} resource link(s) for ${form.name.trim()}.`,
          entity_type: 'consultation',
          entity_id: consultationId,
        } as never);
      }

      await supabase.from('leads').insert({
        name: form.name.trim(),
        property_name: form.company.trim() || form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: '',
        challenge: form.description.trim() || 'New inquiry from consultation scheduler',
        budget: form.budget_range || '',
        source: 'Website',
        stage: 'new_inquiry',
        notes: `Scheduled consultation on ${consultationDate} at ${selectedSlot}`,
      } as never);

      await supabase.from('activity_logs').insert({
        action: `New consultation booked - ${form.name.trim()}${files.length > 0 ? ` with ${files.length} attachment(s)` : ''}`,
        entity_type: 'consultation',
        entity_id: consultationId || consultationDate,
      } as never);

      try {
        const conversationUrl = conversationToken ? `${window.location.origin}/messages/${conversationToken}` : '';
        const confirmHtml = fillTemplate(
          `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
<h2 style="color:#166534;margin-bottom:16px">Consultation Confirmed</h2>
<p>Hi {{name}},</p>
<p>Thank you for scheduling a consultation.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Project Type</td><td style="padding:8px 12px">{{project_type}}</td></tr>
<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Date</td><td style="padding:8px 12px">{{consultation_date}}</td></tr>
<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Time</td><td style="padding:8px 12px">{{consultation_time}}</td></tr>
</table>
<p>I will contact you shortly to confirm.</p>
${conversationUrl ? `<p style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb">
<a href="${conversationUrl}" style="display:inline-block;background:#166534;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Continue the Conversation</a>
</p>
<p style="font-size:13px;color:#6b7280">Or copy this link:<br><span style="color:#166534">${conversationUrl}</span></p>` : ''}
<p style="margin-top:16px;color:#6b7280;font-size:14px">— Rhen</p>
</div>`,
          {
            name: form.name.trim(),
            project_type: form.project_type,
            consultation_date: consultationDate,
            consultation_time: selectedSlot,
          },
        );
        await sendEmail(form.email.trim(), 'Consultation Confirmed', confirmHtml);
        await supabase.from('activity_logs').insert({
          action: `Confirmation email sent to ${form.email.trim()} for ${form.name.trim()}`,
          entity_type: 'consultation',
          entity_id: consultationId || consultationDate,
        } as never);
      } catch {
        try {
          await supabase.from('activity_logs').insert({
            action: `Confirmation email failed for ${form.email.trim()}`,
            entity_type: 'consultation',
            entity_id: consultationId || consultationDate,
          } as never);
        } catch { /* skip */ }
      }

      recordSubmission();

      setSubmitted(true);
      addToast('Consultation scheduled successfully!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      addToast(message, 'error');
      setTurnstileResetKey((k) => k + 1);
      setTurnstileToken(null);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }, [selectedDate, selectedSlot, form, files, links, turnstileToken, useTurnstile, isConfigured, addToast]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleReset = () => {
    setSelectedDate(null);
    setSelectedSlot(null);
    setForm({ name: '', company: '', email: '', phone: '', description: '', project_type: '', budget_range: '' });
    setErrors({});
    setFiles([]);
    setLinks([]);
    setPendingLinkUrl('');
    setPendingLinkLabel('');
    setLinkError('');
    setTurnstileToken(null);
    setTurnstileResetKey((k) => k + 1);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <section className="py-section-gap px-5 lg:px-margin-desktop" id="contact">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CalendarCheck size={32} className="text-emerald-600" />
            </div>
            <h2 className="font-display-xl text-2xl sm:text-3xl font-semibold text-on-surface mb-3">
              Your consultation has been scheduled successfully!
            </h2>
            <div className="bg-surface-container rounded-xl p-4 mb-6 inline-block text-left">
              <p className="font-body-md text-sm text-on-surface-variant mb-1">
                <span className="font-medium text-on-surface">Date:</span>{' '}
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="font-body-md text-sm text-on-surface-variant mb-1">
                <span className="font-medium text-on-surface">Time:</span>{' '}
                {selectedSlot}
              </p>
              <p className="font-body-md text-sm text-on-surface-variant">
                <span className="font-medium text-on-surface">Timezone:</span>{' '}
                {timezone}
              </p>
            </div>
            <MagneticButton variant="primary" onClick={handleReset}>
              Schedule Another Consultation
            </MagneticButton>
          </motion.div>
        </div>
      </section>
    );
  }

  if (configError) {
    return (
      <section className="py-section-gap px-5 lg:px-margin-desktop" id="contact">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
              <CalendarCheck size={32} className="text-red-500" />
            </div>
            <h2 className="font-display-xl text-2xl sm:text-3xl font-semibold text-on-surface mb-3">
              Booking system is not configured
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant mb-8">
              The database connection has not been set up. Please contact the site owner directly.
            </p>
            <MagneticButton variant="primary" onClick={() => setConfigError(false)}>
              Try Again
            </MagneticButton>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-section-gap px-5 lg:px-margin-desktop" id="contact">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter">
        <div className="lg:col-span-5">
          <motion.h2
            className="font-display-xl text-3xl sm:text-5xl md:text-6xl lg:text-display-xl mb-5 sm:mb-6"
            {...fadeUp(0)}
          >
            Let's Build Your{' '}
            <span className="text-primary">Direct Booking System</span>
          </motion.h2>
          <motion.p
            className="font-body-lg text-body-lg text-on-surface-variant mb-6 sm:mb-8"
            {...fadeUp(0.1)}
          >
            Schedule a free 30-minute consultation and let's talk about your
            property, your guests, and how I can help you get more direct
            bookings.
          </motion.p>

          <motion.div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8" {...fadeUp(0.2)}>
            {[
              {
                icon: Clock,
                title: 'Free 30-Minute Consultation',
                desc: 'No commitment, just a friendly conversation.',
              },
              {
                icon: Globe,
                title: 'Tailored to Your Property',
                desc: 'Get insights specific to your resort, villa, or hotel.',
              },
              {
                icon: Lightbulb,
                title: 'Actionable Recommendations',
                desc: 'Walk away with practical next steps for improving your online booking experience.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-2.5 sm:gap-3">
                <div className="mt-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                  <item.icon size={14} className="sm:hidden text-on-primary-container" />
                  <item.icon size={16} className="hidden sm:block text-on-primary-container" />
                </div>
                <div>
                  <h4 className="font-display-xl text-xs sm:text-sm font-semibold text-on-surface">
                    {item.title}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-xl bg-surface-container"
            {...fadeUp(0.3)}
          >
            {[
              { icon: MapPin, text: 'Based in the Philippines' },
              { icon: Globe, text: 'Serving properties worldwide' },
              {
                icon: CheckCircle,
                text: 'Typically responds within 24 hours',
              },
            ].map((item) => (
              <p
                key={item.text}
                className="font-body-md text-body-md text-on-surface-variant/70 flex items-center gap-1.5 sm:gap-2"
              >
                <item.icon size={12} className="sm:hidden text-primary shrink-0" />
                <item.icon size={14} className="hidden sm:block text-primary shrink-0" />
                {item.text}
              </p>
            ))}
          </motion.div>
        </div>

        <motion.div className="lg:col-span-7" {...fadeUp(0)} id="scheduler">
          <div className="rounded-2xl border border-outline/40 bg-surface p-5 sm:p-7 lg:p-8 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`flex items-center gap-1.5 sm:gap-2 ${
                    s < step
                      ? 'text-primary'
                      : s === step
                        ? 'text-on-surface'
                        : 'text-on-surface-variant/40'
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold transition-colors duration-300 ${
                      s < step
                        ? 'bg-primary-container text-on-primary-container'
                        : s === step
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant/40'
                    }`}
                  >
                    {s < step ? <CheckCircle size={12} className="sm:hidden" /> : null}
                    {s < step ? <CheckCircle size={14} className="hidden sm:block" /> : null}
                    {s >= step && (s === step ? s : s)}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">
                    {s === 1 ? 'Select Date & Time' : 'Your Details'}
                  </span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-4 sm:mb-5">
                    <label className="block font-display-xl text-[10px] sm:text-xs font-semibold text-on-surface-variant mb-1.5 sm:mb-2 uppercase tracking-wider">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-surface-container border border-outline/40 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="font-display-xl text-xs sm:text-sm font-semibold text-on-surface mb-3">
                    Select a Consultation Date
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    <Calendar
                      selectedDate={selectedDate}
                      onSelectDate={handleDateSelect}
                      highlighted={highlight}
                      blockedDates={blockedDateStrs}
                    />
                    <TimeSlotPicker
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                      availableSlots={availableSlots}
                      bookedSlots={bookedSlots}
                      loading={slotsLoading}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between mb-5 sm:mb-6 p-2.5 sm:p-3 rounded-xl bg-primary-container/40 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Clock size={14} className="sm:hidden text-on-primary" />
                        <Clock size={16} className="hidden sm:block text-on-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-md text-xs sm:text-body-md font-medium text-on-surface truncate">
                          {selectedDate?.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant">
                          {selectedSlot}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSlot(null)}
                      className="text-xs sm:text-sm font-medium text-primary hover:underline shrink-0 flex items-center gap-1"
                      aria-label="Change date and time"
                    >
                      <ArrowLeft size={12} />
                      Change
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
                    <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                      <label htmlFor="website">Website</label>
                      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <FormField
                        placeholder="Your Name"
                        value={form.name}
                        onChange={(v) => updateForm('name', v)}
                        error={errors.name}
                        required
                      />
                      <FormField
                        placeholder="Email Address"
                        type="email"
                        value={form.email}
                        onChange={(v) => updateForm('email', v)}
                        error={errors.email}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <FormField
                        placeholder="Company / Property Name"
                        value={form.company}
                        onChange={(v) => updateForm('company', v)}
                      />
                      <FormField
                        placeholder="Phone Number"
                        type="tel"
                        value={form.phone}
                        onChange={(v) => updateForm('phone', v)}
                      />
                    </div>

                    <div>
                      <select
                        value={form.project_type}
                        onChange={(e) => updateForm('project_type', e.target.value)}
                        className={`w-full bg-transparent border-b py-3 sm:py-3.5 focus:outline-none focus:border-primary transition-all font-body-md text-body-md text-on-surface ${errors.project_type ? 'border-error' : 'border-outline/40'}`}
                        aria-required
                        aria-invalid={!!errors.project_type}
                      >
                        <option value="">Select Project Type *</option>
                        {PROJECT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {errors.project_type && <p className="text-[10px] text-error mt-1">{errors.project_type}</p>}
                    </div>

                    <FormField
                      placeholder="Brief description of your project or booking challenges"
                      textarea
                      value={form.description}
                      onChange={(v) => updateForm('description', v)}
                      error={errors.description}
                    />

                    <div>
                      <label className="block font-display-xl text-[10px] sm:text-xs font-semibold text-on-surface-variant mb-1.5 sm:mb-2 uppercase tracking-wider">
                        Attachments (optional)
                      </label>
                      <p className="text-[10px] sm:text-xs text-on-surface-variant/60 mb-2">
                        Share references, floor plans, or screenshots. PDF, PNG, JPG, WEBP, DOCX — max 20 MB each, up to 3 files.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {files.map((file, index) => (
                          <div
                            key={`${file.name}-${file.size}`}
                            className="flex items-center gap-1.5 bg-surface-container rounded-lg px-2.5 py-1.5 text-xs"
                          >
                            <FileText size={12} className="text-primary shrink-0" />
                            <span className="text-on-surface truncate max-w-[120px] sm:max-w-[180px]">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-on-surface-variant hover:text-error transition-colors"
                              aria-label={`Remove ${file.name}`}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {files.length < MAX_FILES && (
                          <label className="flex items-center gap-1.5 bg-surface-container rounded-lg px-2.5 py-1.5 text-xs text-primary cursor-pointer hover:bg-surface-container-highest transition-colors">
                            <Upload size={12} />
                            Add File
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                              aria-label="Upload attachment"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block font-display-xl text-[10px] sm:text-xs font-semibold text-on-surface-variant mb-1.5 sm:mb-2 uppercase tracking-wider">
                        Resources &amp; Links
                      </label>
                      <p className="text-[10px] sm:text-xs text-on-surface-variant/60 mb-2">
                        Share Google Drive folders, Figma designs, existing websites, or any resources that help explain your project.
                      </p>

                      {links.map((link, index) => {
                        const badge = platformBadge(link.url);
                        return (
                          <div key={index} className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2 mb-1.5 text-xs">
                            <span className="shrink-0">{badge.icon}</span>
                            <span className="text-[10px] font-medium text-on-surface-variant uppercase shrink-0">{badge.label}</span>
                            {link.label && <span className="text-on-surface truncate max-w-[100px] sm:max-w-[180px]">{link.label}</span>}
                            <span className="text-on-surface-variant/60 truncate flex-1 hidden sm:inline">{link.url}</span>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors shrink-0" aria-label={`Open ${link.url}`}>
                              <ExternalLink size={12} />
                            </a>
                            <button type="button" onClick={() => removeLink(index)} className="text-on-surface-variant hover:text-error transition-colors shrink-0" aria-label={`Remove link ${index + 1}`}>
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}

                      {links.length < 10 && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Label (optional)"
                              value={pendingLinkLabel}
                              onChange={(e) => setPendingLinkLabel(e.target.value)}
                              className="flex-1 bg-surface-container rounded-lg px-2.5 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/40 transition-shadow w-[100px] sm:w-auto"
                              aria-label="Link label"
                            />
                            <input
                              type="text"
                              placeholder="https://myresort.com"
                              value={pendingLinkUrl}
                              onChange={(e) => { setPendingLinkUrl(e.target.value); setLinkError(''); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                              className="flex-1 bg-surface-container rounded-lg px-2.5 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/40 transition-shadow"
                              aria-label="Link URL"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={addLink}
                            className="flex items-center justify-center gap-1 bg-surface-container rounded-lg px-3 py-1.5 text-xs text-primary hover:bg-surface-container-highest transition-colors shrink-0"
                          >
                            <Link2 size={12} />
                            Add Link
                          </button>
                        </div>
                      )}
                      {linkError && <p className="text-[10px] text-error mt-1">{linkError}</p>}
                    </div>

                    {useTurnstile && (
                      <div key={turnstileResetKey} className="flex justify-center min-h-[65px]">
                        <TurnstileWidget
                          siteKey={turnstileSiteKey}
                          onVerify={setTurnstileToken}
                          onExpire={() => setTurnstileToken(null)}
                        />
                      </div>
                    )}

                    <MagneticButton
                      variant="primary"
                      type="submit"
                      loading={submitting}
                      disabled={submitting}
                    >
                      {uploading ? 'Uploading files...' : submitting ? 'Scheduling...' : 'Schedule Consultation'}
                    </MagneticButton>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
