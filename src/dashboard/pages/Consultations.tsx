import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Eye, XCircle, CheckCircle, X, Loader2, Trash2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ErrorState } from '../components/ErrorState';
import {
  getAppointmentsPage,
  updateAppointment,
  deleteAppointment,
  createActivityLog,
  subscribeToTableChanges,
} from '../data/service';
import { APPOINTMENT_STATUS_LABELS, type Appointment } from '../data/schema';
import { useToast } from '../../lib/toast';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);
  const [approveForm, setApproveForm] = useState({ meeting_link: '', scheduled_at: '', admin_notes: '' });
  const { addToast } = useToast();

  const loadData = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAppointmentsPage(p, PAGE_SIZE);
      setAppointments(result.data);
      setTotalCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  useEffect(() => {
    const unsub = subscribeToTableChanges('appointments', {
      onInsert: (payload) => {
        const record = payload.new as unknown as Appointment;
        if (record) setAppointments((prev) => {
          const exists = prev.some((a) => a.id === record.id);
          return exists ? prev : [record, ...prev].slice(0, PAGE_SIZE);
        });
      },
      onUpdate: (payload) => {
        const record = payload.new as unknown as Appointment;
        if (record?.id) setAppointments((prev) => prev.map((a) => a.id === record.id ? record : a));
      },
      onDelete: (payload) => {
        const old = payload.old as unknown as Appointment;
        if (old?.id) setAppointments((prev) => prev.filter((a) => a.id !== old.id));
      },
    });
    return () => unsub();
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.project_type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || a.status === status;
    return matchesSearch && matchesStatus;
  });

  const statusColorMap: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'danger'> = {
    approved: 'success',
    pending: 'warning',
    completed: 'info',
    rejected: 'danger',
    cancelled: 'neutral',
  };

  const handleStatusUpdate = async (id: string, newStatus: Appointment['status'], label: string) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    await updateAppointment(id, { status: newStatus } as never);
    await createActivityLog({
      action: `Appointment ${label} - ${appt.name}`,
      entity_type: 'appointment',
      entity_id: id,
    } as never);
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
    setSelected((prev) => prev?.id === id ? { ...prev, status: newStatus } : prev);
    addToast(`Appointment ${label}`);
  };

  const handleApprove = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateAppointment(selected.id, {
        status: 'approved',
        meeting_link: approveForm.meeting_link || null,
        scheduled_at: approveForm.scheduled_at || null,
        admin_notes: approveForm.admin_notes || null,
      } as never);
      await createActivityLog({
        action: `Appointment approved - ${selected.name} (${selected.project_type})`,
        entity_type: 'appointment',
        entity_id: selected.id,
      } as never);
      setAppointments((prev) => prev.map((a) => a.id === selected.id ? { ...a, status: 'approved', meeting_link: approveForm.meeting_link || null, scheduled_at: approveForm.scheduled_at || null, admin_notes: approveForm.admin_notes || null } as Appointment : a));
      setSelected((prev) => prev ? { ...prev, status: 'approved', meeting_link: approveForm.meeting_link || null, scheduled_at: approveForm.scheduled_at || null, admin_notes: approveForm.admin_notes || null } as Appointment : null);
      addToast('Appointment approved');
    } catch {
      addToast('Failed to approve appointment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteAppointment(confirmDelete.id);
      await createActivityLog({
        action: `Appointment deleted - ${confirmDelete.label}`,
        entity_type: 'appointment',
        entity_id: confirmDelete.id,
      } as never);
      setConfirmDelete(null);
      setSelected(null);
      setAppointments((prev) => prev.filter((a) => a.id !== confirmDelete.id));
      addToast('Appointment deleted');
      setTotalCount((c) => Math.max(0, c - 1));
    } catch {
      addToast('Failed to delete appointment', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-xl text-xl font-semibold text-on-surface">
          Appointments
        </h1>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1" />
        <div className="relative w-48">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-outline/30 bg-surface text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-36 h-8 text-xs"
        />
      </div>

      <div className="rounded-xl border border-outline/30 bg-surface divide-y divide-outline/10">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-on-surface-variant/60">
            <Loader2 size={16} className="animate-spin mr-2" />
            Loading appointments...
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadData(page)} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-on-surface-variant/60">
            {appointments.length === 0
              ? 'No appointments yet. Share your portfolio to start receiving requests.'
              : 'No appointments match your filters.'}
          </div>
        ) : (
          filtered.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container/40 transition-colors cursor-pointer"
              onClick={() => { setSelected(appt); setApproveForm({ meeting_link: appt.meeting_link ?? '', scheduled_at: appt.scheduled_at ?? '', admin_notes: appt.admin_notes ?? '' }); }}
            >
              <div className="flex flex-col items-center w-12 shrink-0">
                <span className="font-display-xl text-lg font-semibold text-on-surface leading-none">
                  {format(new Date(appt.created_at), 'd')}
                </span>
                <span className="font-body-md text-[10px] text-on-surface-variant uppercase">
                  {format(new Date(appt.created_at), 'MMM')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-sm font-medium text-on-surface truncate">
                  {appt.name}
                </p>
                <p className="font-body-md text-xs text-on-surface-variant">
                  {appt.project_type} — {appt.email}
                </p>
              </div>
              <Badge
                variant={statusColorMap[appt.status] ?? 'neutral'}
                size="sm"
              >
                {APPOINTMENT_STATUS_LABELS[appt.status]}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(appt);
                  setApproveForm({ meeting_link: appt.meeting_link ?? '', scheduled_at: appt.scheduled_at ?? '', admin_notes: appt.admin_notes ?? '' });
                }}
              >
                <Eye size={14} />
              </Button>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} />
            Previous
          </Button>
          <span className="text-xs text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <DialogHeader>
              <DialogTitle>{selected.name}</DialogTitle>
              <DialogDescription>
                {selected.project_type}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Name</p>
                  <p className="text-sm text-on-surface">{selected.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Status</p>
                  <Badge variant={statusColorMap[selected.status] ?? 'neutral'} size="sm">
                    {APPOINTMENT_STATUS_LABELS[selected.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-sm text-on-surface">{selected.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Company</p>
                  <p className="text-sm text-on-surface">{selected.company || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Project Type</p>
                  <p className="text-sm text-on-surface">{selected.project_type}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Budget Range</p>
                  <p className="text-sm text-on-surface">{selected.budget_range || '—'}</p>
                </div>
                {selected.preferred_date && (
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Preferred Date</p>
                    <p className="text-sm text-on-surface">{selected.preferred_date}</p>
                  </div>
                )}
                {selected.preferred_time && (
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Preferred Time</p>
                    <p className="text-sm text-on-surface">{selected.preferred_time}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Submitted</p>
                  <p className="text-sm text-on-surface">{format(new Date(selected.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Description</p>
                <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{selected.description}</p>
              </div>

              {selected.status === 'approved' && (
                <div className="space-y-2 pt-2 border-t border-outline/20">
                  {selected.meeting_link && (
                    <div>
                      <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Meeting Link</p>
                      <a href={selected.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        {selected.meeting_link} <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                  {selected.scheduled_at && (
                    <div>
                      <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Scheduled At</p>
                      <p className="text-sm text-on-surface">{format(new Date(selected.scheduled_at), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  )}
                  {selected.admin_notes && (
                    <div>
                      <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Admin Notes</p>
                      <p className="text-sm text-on-surface-variant">{selected.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {selected.status === 'pending' && (
                <div className="space-y-3 pt-2 border-t border-outline/20">
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Approve with Details</p>
                  <Input
                    placeholder="Meeting link (Google Meet / Zoom)"
                    value={approveForm.meeting_link}
                    onChange={(e) => setApproveForm((p) => ({ ...p, meeting_link: e.target.value }))}
                  />
                  <Input
                    type="datetime-local"
                    placeholder="Scheduled date and time"
                    value={approveForm.scheduled_at}
                    onChange={(e) => setApproveForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                  />
                  <Textarea
                    rows={2}
                    placeholder="Notes for the client"
                    value={approveForm.admin_notes}
                    onChange={(e) => setApproveForm((p) => ({ ...p, admin_notes: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-outline/20">
                {selected.status === 'pending' && (
                  <>
                    <Button size="sm" variant="primary" onClick={handleApprove} disabled={saving}>
                      <CheckCircle size={14} />
                      {saving ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-error" onClick={() => handleStatusUpdate(selected.id, 'rejected', 'rejected')}>
                      <X size={14} />
                      Reject
                    </Button>
                  </>
                )}
                {selected.status === 'approved' && (
                  <Button size="sm" variant="primary" onClick={() => handleStatusUpdate(selected.id, 'completed', 'completed')}>
                    <CheckCircle size={14} />
                    Mark Completed
                  </Button>
                )}
                {selected.status !== 'cancelled' && selected.status !== 'completed' && (
                  <Button size="sm" variant="ghost" className="text-error" onClick={() => handleStatusUpdate(selected.id, 'cancelled', 'cancelled')}>
                    <XCircle size={14} />
                    Cancel
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-error ml-auto" onClick={() => setConfirmDelete({ id: selected.id, label: selected.name })}>
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogHeader>
          <DialogTitle>Delete Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the appointment for "{confirmDelete?.label}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Dialog>
    </div>
  );
}
