import { useState } from 'react';
import { User, Bell, Shield, Palette, Globe } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../../lib/toast';

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Manila', label: 'Philippine Time (UTC+8)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
];

const SETTINGS_KEY = 'rl_dashboard_settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSettings(updates: Record<string, string>) {
  const current = loadSettings();
  const merged = { ...current, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
}

const sections = [
  { id: 'profile', icon: User, title: 'Profile' },
  { id: 'notifications', icon: Bell, title: 'Notifications' },
  { id: 'preferences', icon: Palette, title: 'Preferences' },
  { id: 'timezone', icon: Globe, title: 'Timezone & Region' },
  { id: 'security', icon: Shield, title: 'Security' },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const saved = loadSettings();
  const { addToast } = useToast();

  const handleSave = (label: string, updates: Record<string, string>) => {
    saveSettings(updates);
    addToast(`${label} saved`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                <Input defaultValue={saved.fullName ?? 'Rhen Lumbo'} id="fullName" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Email</label>
                <Input defaultValue={saved.email ?? 'lumborhenrhena@gmail.com'} type="email" id="email" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Phone</label>
                <Input defaultValue={saved.phone ?? '+63 912 345 6789'} type="tel" id="phone" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Title</label>
                <Input defaultValue={saved.title ?? 'Web Developer — Booking Systems Specialist'} id="title" />
              </div>
            </div>
            <Button onClick={() => {
              const el = document.getElementById('fullName') as HTMLInputElement;
              handleSave('Profile', {
                fullName: el?.value ?? '',
                email: (document.getElementById('email') as HTMLInputElement)?.value ?? '',
                phone: (document.getElementById('phone') as HTMLInputElement)?.value ?? '',
                title: (document.getElementById('title') as HTMLInputElement)?.value ?? '',
              });
            }}>Save Changes</Button>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            {[
              'email_new_consultations',
              'email_new_inquiries',
              'email_lead_stage_changes',
              'sms_upcoming_consultations',
            ].map((key) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <Checkbox defaultChecked={saved[key] !== 'false'} id={key} />
                <span className="text-sm text-on-surface">
                  {key === 'email_new_consultations' && 'Email notification for new consultations'}
                  {key === 'email_new_inquiries' && 'Email notification for new inquiries'}
                  {key === 'email_lead_stage_changes' && 'Email notification for lead stage changes'}
                  {key === 'sms_upcoming_consultations' && 'SMS notification for upcoming consultations'}
                </span>
              </label>
            ))}
            <div className="pt-2">
              <Button onClick={() => {
                const prefs: Record<string, string> = {};
                ['email_new_consultations', 'email_new_inquiries', 'email_lead_stage_changes', 'sms_upcoming_consultations'].forEach((key) => {
                  const el = document.getElementById(key) as HTMLInputElement;
                  prefs[key] = el?.checked ? 'true' : 'false';
                });
                handleSave('Notification preferences', prefs);
              }}>Save Preferences</Button>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Default Consultation Duration</label>
              <Select
                options={[
                  { value: '15', label: '15 minutes' },
                  { value: '30', label: '30 minutes' },
                  { value: '45', label: '45 minutes' },
                  { value: '60', label: '60 minutes' },
                ]}
                defaultValue={saved.duration ?? '30'}
                id="duration"
                className="w-48"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Default Reminder Time</label>
              <Select
                options={[
                  { value: '15', label: '15 minutes before' },
                  { value: '30', label: '30 minutes before' },
                  { value: '60', label: '1 hour before' },
                  { value: '1440', label: '1 day before' },
                ]}
                defaultValue={saved.reminder ?? '60'}
                id="reminder"
                className="w-48"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Currency</label>
              <Select
                options={[
                  { value: 'PHP', label: 'Philippine Peso (₱)' },
                  { value: 'USD', label: 'US Dollar ($)' },
                ]}
                defaultValue={saved.currency ?? 'PHP'}
                id="currency"
                className="w-48"
              />
            </div>
            <Button onClick={() => {
              handleSave('Preferences', {
                duration: (document.getElementById('duration') as HTMLSelectElement)?.value ?? '30',
                reminder: (document.getElementById('reminder') as HTMLSelectElement)?.value ?? '60',
                currency: (document.getElementById('currency') as HTMLSelectElement)?.value ?? 'PHP',
              });
            }}>Save Preferences</Button>
          </div>
        );
      case 'timezone':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Timezone</label>
              <Select
                options={TIMEZONE_OPTIONS}
                defaultValue={saved.timezone ?? 'Asia/Manila'}
                id="timezone"
                className="w-64"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Date Format</label>
              <Select
                options={[
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                ]}
                defaultValue={saved.dateFormat ?? 'MM/DD/YYYY'}
                id="dateFormat"
                className="w-48"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Time Format</label>
              <Select
                options={[
                  { value: '12', label: '12-hour (AM/PM)' },
                  { value: '24', label: '24-hour' },
                ]}
                defaultValue={saved.timeFormat ?? '12'}
                id="timeFormat"
                className="w-48"
              />
            </div>
            <Button onClick={() => {
              handleSave('Timezone settings', {
                timezone: (document.getElementById('timezone') as HTMLSelectElement)?.value ?? 'Asia/Manila',
                dateFormat: (document.getElementById('dateFormat') as HTMLSelectElement)?.value ?? 'MM/DD/YYYY',
                timeFormat: (document.getElementById('timeFormat') as HTMLSelectElement)?.value ?? '12',
              });
            }}>Save Changes</Button>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant">Password is managed through Supabase Auth.</p>
            <Button onClick={() => addToast('Password reset link will be sent to your email')}>
              Reset Password
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="font-display-xl text-xl font-semibold text-on-surface mb-6">
        Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        <nav className="space-y-0.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                activeSection === section.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <section.icon size={16} />
              {section.title}
            </button>
          ))}
        </nav>

        <div className="rounded-xl border border-outline/30 bg-surface p-5">
          <h2 className="font-display-xl text-sm font-semibold text-on-surface mb-4 capitalize">
            {sections.find((s) => s.id === activeSection)?.title}
          </h2>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
