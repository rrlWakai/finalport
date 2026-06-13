import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Globe, Lightbulb, MapPin, CheckCircle, CalendarCheck, Loader2 } from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';
import TurnstileWidget from '../ui/TurnstileWidget';
import { useToast } from '../../lib/toast';
import {
  checkRateLimit,
  recordSubmission,
  createAppointment,
  createActivityLog,
} from '../../dashboard/data/service';
import { sendEmail } from '../../lib/email';

const PROJECT_TYPES = [
  'Direct Booking Website',
  'Payment Integration',
  'Website Redesign',
  'SEO / Marketing',
  'Multi-Property System',
  'Channel Manager Integration',
  'Other',
];

const BUDGET_RANGES = [
  '',
  'Less than $1,000',
  '$1,000 – $3,000',
  '$3,000 – $5,000',
  '$5,000 – $10,000',
  '$10,000+',
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] } as const,
});

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
          rows={3}
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
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    project_type: '',
    description: '',
    budget_range: '',
    preferred_date: '',
    preferred_time: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const useTurnstile = !!turnstileSiteKey;

  useEffect(() => {
    const configured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    setIsConfigured(configured);
    if (!configured) {
      setConfigError(false);
    }
  }, []);

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

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    const honeypot = (event.target as HTMLFormElement).website?.value;
    if (honeypot) return;

    if (!validate()) return;

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

    try {
      if (!isConfigured) {
        setConfigError(true);
        addToast('Supabase is not configured. Booking cannot be saved.', 'error');
        return;
      }

      const result = await createAppointment({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        project_type: form.project_type,
        description: form.description.trim(),
        budget_range: form.budget_range || null,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        status: 'pending',
        meeting_link: null,
        scheduled_at: null,
        admin_notes: null,
      });

      if (!result) throw new Error('Failed to create appointment');

      await createActivityLog({
        action: `New appointment request - ${form.name.trim()} (${form.project_type})`,
        entity_type: 'appointment',
        entity_id: result.id,
      } as never);

      try {
        const confirmHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
<h2 style="color:#166534;margin-bottom:16px">Appointment Request Received</h2>
<p>Hi ${form.name.trim()},</p>
<p>Thank you for reaching out! I've received your appointment request and will review it shortly.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Project Type</td><td style="padding:8px 12px">${form.project_type}</td></tr>
<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Description</td><td style="padding:8px 12px">${form.description.trim()}</td></tr>
</table>
<p>I typically respond within 24 hours. If you don't hear from me, feel free to send a follow-up.</p>
<p style="margin-top:16px;color:#6b7280;font-size:14px">— Rhen</p>
</div>`;
        await sendEmail(form.email.trim(), 'Appointment Request Received', confirmHtml);
        await createActivityLog({
          action: `Confirmation email sent to ${form.email.trim()}`,
          entity_type: 'appointment',
          entity_id: result.id,
        } as never);

        try {
          const adminHtml = `<h2>New Appointment Request</h2>
<p><strong>Client:</strong> ${form.name.trim()}</p>
<p><strong>Email:</strong> ${form.email.trim()}</p>
<p><strong>Project Type:</strong> ${form.project_type}</p>
<p><strong>Description:</strong></p>
<blockquote>${form.description.trim()}</blockquote>
<p><a href="${window.location.origin}/dashboard">Open Dashboard</a></p>`;
          await sendEmail(import.meta.env.VITE_ADMIN_EMAIL || 'rhen.esparas091513@gmail.com', `New Appointment: ${form.name.trim()}`, adminHtml);
        } catch {
          await createActivityLog({
            action: `Admin notification email failed for ${form.name.trim()}`,
            entity_type: 'appointment',
            entity_id: result.id,
          } as never);
        }
      } catch {
        await createActivityLog({
          action: `Confirmation email failed for ${form.email.trim()}`,
          entity_type: 'appointment',
          entity_id: result.id,
        } as never);
      }

      recordSubmission();
      setSubmitted(true);
      addToast('Appointment request submitted successfully!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      addToast(message, 'error');
      setTurnstileResetKey((k) => k + 1);
      setTurnstileToken(null);
    } finally {
      setSubmitting(false);
    }
  }, [form, turnstileToken, useTurnstile, isConfigured, addToast]);

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
              Appointment Request Received!
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">
              Thank you, {form.name}! I'll review your request and get back to you within 24 hours.
            </p>
            <MagneticButton variant="primary" onClick={() => {
              setSubmitted(false);
              setForm({ name: '', email: '', company: '', project_type: '', description: '', budget_range: '', preferred_date: '', preferred_time: '' });
            }}>
              Submit Another Request
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
            Schedule a free consultation and let's talk about your property,
            your guests, and how I can help you get more direct bookings.
          </motion.p>

          <motion.div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8" {...fadeUp(0.2)}>
            {[
              {
                icon: Clock,
                title: 'Free Consultation',
                desc: 'No commitment, just a friendly conversation about your goals.',
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

              <FormField
                placeholder="Company Name (optional)"
                value={form.company}
                onChange={(v) => updateForm('company', v)}
              />

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
                placeholder="Describe your project or booking challenges *"
                textarea
                value={form.description}
                onChange={(v) => updateForm('description', v)}
                error={errors.description}
              />

              <div>
                <select
                  value={form.budget_range}
                  onChange={(e) => updateForm('budget_range', e.target.value)}
                  className="w-full bg-transparent border-b py-3 sm:py-3.5 focus:outline-none focus:border-primary transition-all font-body-md text-body-md text-on-surface border-outline/40"
                >
                  {BUDGET_RANGES.map((r) => (
                    <option key={r} value={r}>{r || 'Budget Range (optional)'}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                    Preferred Date (optional)
                  </label>
                  <input
                    type="date"
                    value={form.preferred_date}
                    onChange={(e) => updateForm('preferred_date', e.target.value)}
                    className="w-full bg-transparent border-b py-3 sm:py-3.5 focus:outline-none focus:border-primary transition-all font-body-md text-body-md text-on-surface border-outline/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                    Preferred Time (optional)
                  </label>
                  <input
                    type="time"
                    value={form.preferred_time}
                    onChange={(e) => updateForm('preferred_time', e.target.value)}
                    className="w-full bg-transparent border-b py-3 sm:py-3.5 focus:outline-none focus:border-primary transition-all font-body-md text-body-md text-on-surface border-outline/40"
                  />
                </div>
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
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Submitting...
                  </span>
                ) : 'Book a Consultation'}
              </MagneticButton>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
