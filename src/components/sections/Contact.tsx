import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Globe,
  Lightbulb,
  MapPin,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
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

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] } as const,
});

function Calendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
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

  return (
    <div>
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

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(date)}
              disabled={past}
              className={`
                aspect-square rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                ${past
                  ? 'text-surface-container-highest cursor-not-allowed'
                  : dateStr === selectedStr
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'hover:bg-primary-container/50 text-on-surface active:bg-primary-container/70'
                }
              `}
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
}: {
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}) {
  return (
    <div>
      <h4 className="font-display-xl text-xs sm:text-sm font-semibold text-on-surface mb-2.5 sm:mb-3">
        Available Times
      </h4>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot}
            onClick={() => onSelectSlot(slot)}
            className={`
              py-2.5 sm:py-3 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
              ${selectedSlot === slot
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container text-on-surface-variant hover:bg-primary-container/50 hover:text-on-surface active:bg-primary-container/70'
              }
            `}
          >
            {slot}
          </button>
        ))}
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
}: {
  placeholder: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const base =
    'w-full bg-transparent border-b border-outline/40 py-3 sm:py-3.5 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40 font-body-md text-body-md text-on-surface';

  if (textarea) {
    return (
      <div className="relative group">
        <textarea
          placeholder={placeholder}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} resize-none`}
        />
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-focus-within:w-full transition-all duration-500" />
      </div>
    );
  }

  return (
    <div className="relative group">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-focus-within:w-full transition-all duration-500" />
    </div>
  );
}

export function Contact() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Manila',
  );
  const [form, setForm] = useState({
    name: '',
    property: '',
    email: '',
    phone: '',
    description: '',
  });

  const step = selectedDate && selectedSlot ? 2 : 1;

  const updateForm = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

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

        <motion.div className="lg:col-span-7" {...fadeUp(0)}>
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
                      className="w-full bg-surface-container border border-outline/40 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    <Calendar
                      selectedDate={selectedDate}
                      onSelectDate={handleDateSelect}
                    />
                    <TimeSlotPicker
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
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
                      className="text-xs sm:text-sm font-medium text-primary hover:underline shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <FormField
                        placeholder="Your Name"
                        value={form.name}
                        onChange={(v) => updateForm('name', v)}
                      />
                      <FormField
                        placeholder="Property Name"
                        value={form.property}
                        onChange={(v) => updateForm('property', v)}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <FormField
                        placeholder="Email Address"
                        type="email"
                        value={form.email}
                        onChange={(v) => updateForm('email', v)}
                      />
                      <FormField
                        placeholder="Phone Number"
                        type="tel"
                        value={form.phone}
                        onChange={(v) => updateForm('phone', v)}
                      />
                    </div>
                    <FormField
                      placeholder="Brief description of your project or booking challenges"
                      textarea
                      value={form.description}
                      onChange={(v) => updateForm('description', v)}
                    />
                    <MagneticButton variant="primary" type="submit">
                      Schedule Consultation
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
