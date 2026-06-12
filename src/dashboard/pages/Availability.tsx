import { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ErrorState } from '../components/ErrorState';
import {
  getAvailability,
  updateAvailabilitySlot,
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  getBlockedDates,
  createBlockedDate,
  deleteBlockedDate,
  createActivityLog,
  subscribeToTableChanges,
} from '../data/service';
import { DAYS_OF_WEEK, type Availability, type BlockedDate } from '../data/schema';
import { format } from 'date-fns';
import { useToast } from '../../lib/toast';

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Manila', label: 'Philippine Time (UTC+8)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
];

const DAY_OPTIONS = DAYS_OF_WEEK.map((label, value) => ({ value: String(value), label }));

export function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timezone, setTimezone] = useState('Asia/Manila');
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [newSlotDay, setNewSlotDay] = useState('0');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('17:00');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [avail, blocked] = await Promise.all([
        getAvailability(),
        getBlockedDates(),
      ]);
      setAvailability(avail);
      setBlockedDates(blocked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsub1 = subscribeToTableChanges('availability', {
      onInsert: (payload) => {
        const record = payload.new as unknown as Availability;
        if (record) setAvailability((prev) => {
          const exists = prev.some((a) => a.id === record.id);
          return exists ? prev : [...prev, record].sort((a, b) => a.day_of_week - b.day_of_week);
        });
      },
      onUpdate: (payload) => {
        const record = payload.new as unknown as Availability;
        if (record?.id) setAvailability((prev) => prev.map((a) => a.id === record.id ? record : a));
      },
      onDelete: (payload) => {
        const old = payload.old as unknown as Availability;
        if (old?.id) setAvailability((prev) => prev.filter((a) => a.id !== old.id));
      },
    });
    const unsub2 = subscribeToTableChanges('blocked_dates', {
      onInsert: (payload) => {
        const record = payload.new as unknown as BlockedDate;
        if (record) setBlockedDates((prev) => {
          const exists = prev.some((b) => b.id === record.id);
          return exists ? prev : [...prev, record];
        });
      },
      onDelete: (payload) => {
        const old = payload.old as unknown as BlockedDate;
        if (old?.id) setBlockedDates((prev) => prev.filter((b) => b.id !== old.id));
      },
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const toggleDay = async (slot: Availability) => {
    const updated = { is_available: !slot.is_available };
    setAvailability((prev) =>
      prev.map((a) => (a.id === slot.id ? { ...a, ...updated } : a)),
    );
    await updateAvailabilitySlot(slot.id, updated as never);
    await createActivityLog({
      action: `Availability ${slot.is_available ? 'disabled' : 'enabled'} - ${DAYS_OF_WEEK[slot.day_of_week] ?? 'Unknown'}`,
      entity_type: 'availability',
      entity_id: slot.id,
    } as never);
    addToast(`${DAYS_OF_WEEK[slot.day_of_week] ?? 'Unknown'} ${slot.is_available ? 'disabled' : 'enabled'}`);
  };

  const updateTime = async (
    slot: Availability,
    field: 'start_time' | 'end_time',
    value: string,
  ) => {
    setAvailability((prev) =>
      prev.map((a) => (a.id === slot.id ? { ...a, [field]: value } : a)),
    );
    await updateAvailabilitySlot(slot.id, { [field]: value } as never);
    addToast('Time updated');
  };

  const addSlot = async () => {
    const dayNum = parseInt(newSlotDay, 10);
    const dayName = DAYS_OF_WEEK[dayNum] ?? 'Unknown';
    const exists = availability.some((a) => a.day_of_week === dayNum);
    if (exists) {
      addToast('A slot for this day already exists', 'error');
      return;
    }
    const result = await createAvailabilitySlot({
      day_of_week: dayNum,
      start_time: newSlotStart,
      end_time: newSlotEnd,
      is_available: true,
    } as never);
    if (result) {
      await createActivityLog({
        action: `Availability slot created - ${dayName}`,
        entity_type: 'availability',
        entity_id: result.id,
      } as never);
      addToast(`Slot added for ${dayName}`);
      setAvailability((prev) => [...prev, result as Availability].sort((a, b) => a.day_of_week - b.day_of_week));
    }
  };

  const removeSlot = async () => {
    if (!confirmDelete) return;
    try {
      await deleteAvailabilitySlot(confirmDelete.id);
      await createActivityLog({
        action: `Availability slot deleted - ${confirmDelete.label}`,
        entity_type: 'availability',
        entity_id: confirmDelete.id,
      } as never);
      setAvailability((prev) => prev.filter((a) => a.id !== confirmDelete.id));
      setConfirmDelete(null);
      addToast('Slot deleted');
    } catch {
      addToast('Failed to delete slot', 'error');
    }
  };

  const addBlockedDate = async () => {
    if (!newBlockDate) return;
    const result = await createBlockedDate({
      date: newBlockDate,
      reason: newBlockReason || 'Unavailable',
    } as never);
    if (result) {
      await createActivityLog({
        action: `Blocked date added - ${newBlockDate}`,
        entity_type: 'blocked_date',
        entity_id: result.id,
      } as never);
      setBlockedDates((prev) => [...prev, result as BlockedDate]);
      addToast('Date blocked');
    }
    setNewBlockDate('');
    setNewBlockReason('');
  };

  const removeBlockedDate = async (id: string) => {
    const block = blockedDates.find((b) => b.id === id);
    await deleteBlockedDate(id);
    if (block) {
      await createActivityLog({
        action: `Blocked date removed - ${block.date}`,
        entity_type: 'blocked_date',
        entity_id: id,
      } as never);
    }
    setBlockedDates((prev) => prev.filter((b) => b.id !== id));
    addToast('Blocked date removed');
  };

  return (
    <div>
      <h1 className="font-display-xl text-xl font-semibold text-on-surface mb-6">
        Availability
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-on-surface-variant/60">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading availability...
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display-xl text-sm font-semibold text-on-surface">
                Weekly Schedule
              </h2>
              <Select
                options={TIMEZONE_OPTIONS}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-56 h-8 text-xs"
              />
            </div>

            <div className="rounded-xl border border-outline/30 bg-surface divide-y divide-outline/10 mb-4">
              {availability.length === 0 ? (
                <div className="py-8 text-center text-sm text-on-surface-variant/60">
                  No availability configured.
                </div>
              ) : (
                availability.map((slot) => {
                  const dayName = DAYS_OF_WEEK[slot.day_of_week] ?? 'Unknown';
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <button
                        onClick={() => toggleDay(slot)}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                      >
                        {slot.is_available ? (
                          <ToggleRight size={20} className="text-primary" />
                        ) : (
                          <ToggleLeft size={20} />
                        )}
                      </button>
                      <span
                        className={`font-body-md text-sm w-24 font-medium ${
                          slot.is_available
                            ? 'text-on-surface'
                            : 'text-on-surface-variant/50 line-through'
                        }`}
                      >
                        {dayName}
                      </span>
                      {slot.is_available ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) =>
                              updateTime(slot, 'start_time', e.target.value)
                            }
                            className="h-8 w-24 rounded-lg border border-outline/30 bg-surface px-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                          />
                          <span className="text-xs text-on-surface-variant">to</span>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) =>
                              updateTime(slot, 'end_time', e.target.value)
                            }
                            className="h-8 w-24 rounded-lg border border-outline/30 bg-surface px-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant/50">
                          Unavailable
                        </span>
                      )}
                      <button
                        onClick={() => setConfirmDelete({ id: slot.id, label: dayName })}
                        className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors ml-auto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="rounded-xl border border-outline/30 bg-surface p-4">
              <h3 className="font-body-md text-xs font-semibold text-on-surface mb-3">Add Slot</h3>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[120px]">
                  <p className="text-[10px] font-medium text-on-surface-variant mb-1">Day</p>
                  <Select options={DAY_OPTIONS} value={newSlotDay} onChange={(e) => setNewSlotDay(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant mb-1">Start</p>
                  <input
                    type="time"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="h-8 w-24 rounded-lg border border-outline/30 bg-surface px-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant mb-1">End</p>
                  <input
                    type="time"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="h-8 w-24 rounded-lg border border-outline/30 bg-surface px-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <Button size="sm" onClick={addSlot}>
                  <Plus size={14} />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display-xl text-sm font-semibold text-on-surface mb-4">
              Blocked Dates
            </h2>

            <div className="rounded-xl border border-outline/30 bg-surface p-4 mb-4">
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  className="flex-1 h-8 rounded-lg border border-outline/30 bg-surface px-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                />
                <Button size="sm" onClick={addBlockedDate}>
                  <Plus size={14} />
                  Block
                </Button>
              </div>
              <input
                placeholder="Reason (optional)"
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                className="w-full h-8 rounded-lg border border-outline/30 bg-surface px-2 text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="rounded-xl border border-outline/30 bg-surface divide-y divide-outline/10">
              {blockedDates.length === 0 ? (
                <div className="py-8 text-center text-sm text-on-surface-variant/60">
                  No blocked dates.
                </div>
              ) : (
                blockedDates.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <div>
                      <p className="font-body-md text-sm text-on-surface">
                        {format(new Date(block.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="font-body-md text-xs text-on-surface-variant">
                        {block.reason}
                      </p>
                    </div>
                    <button
                      onClick={() => removeBlockedDate(block.id)}
                      className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogHeader>
          <DialogTitle>Delete Slot</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the slot for "{confirmDelete?.label}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={removeSlot}>Delete</Button>
        </div>
      </Dialog>
    </div>
  );
}
