import { useState, useMemo, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ErrorState } from '../components/ErrorState';
import {
  getAppointments,
  getBlockedDates,
  subscribeToTableChanges,
} from '../data/service';
import { APPOINTMENT_STATUS_LABELS, type Appointment, type BlockedDate } from '../data/schema';

export function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appts, blocked] = await Promise.all([
        getAppointments(),
        getBlockedDates(),
      ]);
      setAppointments(appts);
      setBlockedDates(blocked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsub1 = subscribeToTableChanges('appointments', {
      onInsert: (payload) => {
        const record = (payload as Record<string, unknown>).new as unknown as Appointment;
        if (record) setAppointments((prev) => {
          const exists = prev.some((a) => a.id === record.id);
          return exists ? prev : [...prev, record];
        });
      },
      onUpdate: (payload) => {
        const record = (payload as Record<string, unknown>).new as unknown as Appointment;
        if (record?.id) setAppointments((prev) => prev.map((a) => a.id === record.id ? record : a));
      },
      onDelete: (payload) => {
        const old = (payload as Record<string, unknown>).old as unknown as Appointment;
        if (old?.id) setAppointments((prev) => prev.filter((a) => a.id !== old.id));
      },
    });
    const unsub2 = subscribeToTableChanges('blocked_dates', {
      onInsert: (payload) => {
        const record = (payload as Record<string, unknown>).new as unknown as BlockedDate;
        if (record && !blockedDates.some((b) => b.id === record.id)) {
          setBlockedDates((prev) => [...prev, record]);
        }
      },
      onDelete: (payload) => {
        const old = (payload as Record<string, unknown>).old as unknown as BlockedDate;
        if (old?.id) setBlockedDates((prev) => prev.filter((b) => b.id !== old.id));
      },
    });
    return () => { unsub1(); unsub2(); };
  }, [blockedDates]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const apptsOnDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return appointments.filter((a) => a.preferred_date === dateStr);
  }, [selectedDate, appointments]);

  const blockedOnDate = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return blockedDates.find((b) => b.date === dateStr) ?? null;
  }, [selectedDate, blockedDates]);

  const getApptCount = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return appointments.filter(
      (a) => a.preferred_date === dateStr && a.status !== 'cancelled',
    ).length;
  };

  const isBlocked = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return blockedDates.some((b) => b.date === dateStr);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-xl text-xl font-semibold text-on-surface">
          Calendar
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
            <CalendarDays size={14} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-on-surface-variant/60">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading calendar...
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="rounded-xl border border-outline/30 bg-surface p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="font-display-xl text-sm font-semibold text-on-surface">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-medium text-on-surface-variant/50 py-1 uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const inMonth = isSameMonth(day, currentDate);
                const selected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);
                const count = getApptCount(day);
                const blocked = isBlocked(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(inMonth ? day : null)}
                    className={`
                      aspect-square rounded-lg text-xs font-medium transition-all duration-200 relative
                      ${!inMonth
                        ? 'text-outline/40 cursor-default'
                        : selected
                          ? 'bg-primary text-on-primary shadow-sm'
                          : today
                            ? 'border border-primary/40 text-on-surface'
                            : 'hover:bg-surface-container text-on-surface'
                      }
                    `}
                  >
                    <span>{format(day, 'd')}</span>
                    {inMonth && count > 0 && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                    {inMonth && blocked && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-error/60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-display-xl text-sm font-semibold text-on-surface mb-3">
              {selectedDate
                ? format(selectedDate, 'EEEE, MMMM d')
                : 'Select a date'}
            </h3>

            {blockedOnDate && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 mb-3">
                <p className="text-xs font-medium text-red-800">Blocked</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {blockedOnDate.reason}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {apptsOnDate.length === 0 && selectedDate && !blockedOnDate ? (
                <p className="text-sm text-on-surface-variant/60 py-4 text-center">
                  No appointments on this day.
                </p>
              ) : (
                apptsOnDate.map((appt) => (
                  <div
                    key={appt.id}
                    className="rounded-xl border border-outline/30 bg-surface p-3 hover:border-outline/60 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body-md text-xs font-medium text-primary">
                        {appt.preferred_time || '—'}
                      </span>
                      <Badge
                        variant={appt.status === 'approved' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {APPOINTMENT_STATUS_LABELS[appt.status]}
                      </Badge>
                    </div>
                    <p className="font-body-md text-sm font-medium text-on-surface">
                      {appt.name}
                    </p>
                    <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                      {appt.project_type}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
