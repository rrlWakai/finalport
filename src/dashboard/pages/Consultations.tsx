import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Eye, XCircle, CheckCircle, Loader2, Trash2, Edit3, Download, FileText, ImageIcon, ChevronLeft, ChevronRight, Link2, ExternalLink, Copy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ErrorState } from '../components/ErrorState';
import { supabase } from '../lib/supabase';
import {
  getConsultationsPage,
  updateConsultation,
  deleteConsultation,
  createActivityLog,
  subscribeToTableChanges,
  getAttachments,
  getAttachmentUrl,
  deleteAttachment,
  getConsultationLinks,
  deleteConsultationLink,
  getConversationMessages,
  sendConversationMessage,
  markConversationAsRead,
  sanitize,
} from '../data/service';
import { CONSULTATION_STATUS_LABELS, type Consultation, type ConsultationAttachment, type ConsultationLink, type ConversationMessage } from '../data/schema';
import { useToast } from '../../lib/toast';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
];

const STATUS_CHOICES = STATUS_OPTIONS.filter((o) => o.value);

export function Consultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Consultation>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);
  const [attachments, setAttachments] = useState<ConsultationAttachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [confirmDeleteAttachment, setConfirmDeleteAttachment] = useState<ConsultationAttachment | null>(null);
  const [links, setLinks] = useState<ConsultationLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [confirmDeleteLink, setConfirmDeleteLink] = useState<ConsultationLink | null>(null);
  const [detailTab, setDetailTab] = useState<'details' | 'messages'>('details');
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingAdminReply, setSendingAdminReply] = useState(false);
  const { addToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0] ?? '';

  const loadData = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getConsultationsPage(p, PAGE_SIZE);
      setConsultations(result.data);
      setTotalCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  useEffect(() => {
    const unsub = subscribeToTableChanges('consultations', {
      onInsert: (payload) => {
        const record = payload.new as unknown as Consultation;
        if (record) setConsultations((prev) => {
          const exists = prev.some((c) => c.id === record.id);
          return exists ? prev : [record, ...prev].slice(0, PAGE_SIZE);
        });
      },
      onUpdate: (payload) => {
        const record = payload.new as unknown as Consultation;
        if (record?.id) setConsultations((prev) => prev.map((c) => c.id === record.id ? record : c));
      },
      onDelete: (payload) => {
        const old = payload.old as unknown as Consultation;
        if (old?.id) setConsultations((prev) => prev.filter((c) => c.id !== old.id));
      },
    });
    return () => unsub();
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filtered = consultations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.property_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || c.status === status;
    const matchesTab =
      tab === 'upcoming'
        ? c.consultation_date >= todayStr && c.status !== 'cancelled'
        : c.consultation_date < todayStr || c.status === 'cancelled' || c.status === 'no_show';
    return matchesSearch && matchesStatus && matchesTab;
  });

  const statusColorMap: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'danger'> = {
    confirmed: 'success',
    pending: 'warning',
    completed: 'info',
    cancelled: 'neutral',
    no_show: 'danger',
  };

  const handleStatusUpdate = async (id: string, newStatus: Consultation['status'], label: string) => {
    const consult = consultations.find((c) => c.id === id);
    if (!consult) return;
    await updateConsultation(id, { status: newStatus } as never);
    await createActivityLog({
      action: `Consultation ${label} - ${consult.property_name}`,
      entity_type: 'consultation',
      entity_id: id,
    } as never);
    setConsultations((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
    setSelected((prev) => prev?.id === id ? { ...prev, status: newStatus } : prev);
    addToast(`Consultation ${label}`);
  };

  const startEditing = (consult: Consultation) => {
    setEditForm({
      name: consult.name,
      property_name: consult.property_name,
      email: consult.email,
      phone: consult.phone,
      consultation_date: consult.consultation_date,
      consultation_time: consult.consultation_time,
      notes: consult.notes,
      status: consult.status,
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateConsultation(selected.id, editForm as never);
      await createActivityLog({
        action: `Consultation updated - ${editForm.property_name ?? selected.property_name}`,
        entity_type: 'consultation',
        entity_id: selected.id,
      } as never);
      setEditing(false);
      setSelected((prev) => prev ? { ...prev, ...editForm } as Consultation : null);
      addToast('Consultation updated');
      setConsultations((prev) =>
        prev.map((c) => c.id === selected.id ? { ...c, ...editForm } as Consultation : c),
      );
    } catch {
      addToast('Failed to update consultation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteConsultation(confirmDelete.id);
      await createActivityLog({
        action: `Consultation deleted - ${confirmDelete.label}`,
        entity_type: 'consultation',
        entity_id: confirmDelete.id,
      } as never);
      setConfirmDelete(null);
      setSelected(null);
      setConsultations((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      addToast('Consultation deleted');
      setTotalCount((c) => Math.max(0, c - 1));
    } catch {
      addToast('Failed to delete consultation', 'error');
    }
  };

  const handleDeleteAttachment = async () => {
    if (!confirmDeleteAttachment) return;
    try {
      await deleteAttachment(confirmDeleteAttachment);
      setAttachments((prev) => prev.filter((a) => a.id !== confirmDeleteAttachment.id));
      await createActivityLog({
        action: `Attachment deleted - ${confirmDeleteAttachment.file_name}`,
        entity_type: 'consultation',
        entity_id: confirmDeleteAttachment.consultation_id,
      } as never);
      setConfirmDeleteAttachment(null);
      addToast('Attachment deleted');
    } catch {
      addToast('Failed to delete attachment', 'error');
    }
  };

  const handleDeleteLink = async () => {
    if (!confirmDeleteLink) return;
    try {
      await deleteConsultationLink(confirmDeleteLink.id);
      setLinks((prev) => prev.filter((l) => l.id !== confirmDeleteLink.id));
      await createActivityLog({
        action: `Resource link deleted - ${confirmDeleteLink.url}`,
        entity_type: 'consultation',
        entity_id: confirmDeleteLink.consultation_id,
      } as never);
      setConfirmDeleteLink(null);
      addToast('Link deleted');
    } catch {
      addToast('Failed to delete link', 'error');
    }
  };

  useEffect(() => {
    if (!selected) { setAttachments([]); setLinks([]); return; }
    let cancelled = false;
    (async () => {
      setAttachmentsLoading(true);
      setLinksLoading(true);
      try {
        const [attData, linkData] = await Promise.all([
          getAttachments(selected.id),
          getConsultationLinks(selected.id),
        ]);
        if (!cancelled) { setAttachments(attData); setLinks(linkData); }
      } catch {
        // silent
      } finally {
        if (!cancelled) { setAttachmentsLoading(false); setLinksLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [selected?.id]);

  useEffect(() => {
    if (!selected || detailTab !== 'messages') return;
    let cancelled = false;
    (async () => {
      setConversationLoading(true);
      try {
        const msgs = await getConversationMessages(selected.id);
        if (!cancelled) setConversationMessages(msgs);
      } catch {
        // silent
      } finally {
        if (!cancelled) setConversationLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selected?.id, detailTab]);

  useEffect(() => {
    if (!selected) return;
    const channel = supabase.channel(`admin-conv-${selected.id}`)
      .on('postgres_changes' as never,
        { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `consultation_id=eq.${selected.id}` } as never,
        (payload: unknown) => {
          const msg = (payload as Record<string, unknown>).new as ConversationMessage;
          if (msg) setConversationMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selected?.id]);

  useEffect(() => {
    if (!selected || detailTab !== 'messages') return;
    const unread = conversationMessages.filter((m) => m.sender_type === 'client' && !m.read_at);
    if (unread.length === 0) return;
    markConversationAsRead(selected.id).catch(() => {});
    setConversationMessages((prev) => prev.map((m) =>
      m.sender_type === 'client' && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m,
    ));
  }, [detailTab, selected?.id, conversationMessages.length]);

  const handleSendAdminReply = async () => {
    if (!selected || !adminReplyText.trim() || sendingAdminReply) return;
    setSendingAdminReply(true);
    try {
      const result = await sendConversationMessage(selected.id, 'admin', adminReplyText.trim());
      if (result) {
        await createActivityLog({
          action: `Admin replied to ${selected.property_name} consultation.`,
          entity_type: 'consultation',
          entity_id: selected.id,
        } as never);
        setAdminReplyText('');
      }
    } catch {
      addToast('Failed to send reply', 'error');
    } finally {
      setSendingAdminReply(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-xl text-xl font-semibold text-on-surface">
          Consultations
        </h1>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1 p-0.5 rounded-lg bg-surface-container border border-outline/20">
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === t
                  ? 'bg-surface text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>
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
            Loading consultations...
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadData(page)} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-on-surface-variant/60">
            {consultations.length === 0
              ? 'No consultations yet. Share your portfolio to start receiving bookings.'
              : 'No consultations match your filters.'}
          </div>
        ) : (
          filtered.map((consult) => (
            <div
              key={consult.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container/40 transition-colors cursor-pointer"
              onClick={() => { setSelected(consult); setEditing(false); }}
            >
              <div className="flex flex-col items-center w-12 shrink-0">
                <span className="font-display-xl text-lg font-semibold text-on-surface leading-none">
                  {format(new Date(consult.consultation_date), 'd')}
                </span>
                <span className="font-body-md text-[10px] text-on-surface-variant uppercase">
                  {format(new Date(consult.consultation_date), 'MMM')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-sm font-medium text-on-surface truncate">
                  {consult.property_name}
                </p>
                <p className="font-body-md text-xs text-on-surface-variant">
                  {consult.name} — {consult.consultation_time}
                </p>
              </div>
              <Badge
                variant={statusColorMap[consult.status] ?? 'neutral'}
                size="sm"
              >
                {CONSULTATION_STATUS_LABELS[consult.status]}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(consult);
                  setEditing(false);
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
        onClose={() => { setSelected(null); setEditing(false); }}
      >
        {selected && !editing && (
          <>
            <DialogHeader>
              <DialogTitle>{selected.property_name}</DialogTitle>
              <DialogDescription>
                Consultation with {selected.name}
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-1 p-0.5 rounded-lg bg-surface-container border border-outline/20 mb-3">
              <button
                onClick={() => setDetailTab('details')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  detailTab === 'details' ? 'bg-surface text-on-surface shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => { setDetailTab('messages'); setAdminReplyText(''); }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  detailTab === 'messages' ? 'bg-surface text-on-surface shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Messages
                {conversationMessages.filter((m) => m.sender_type === 'client' && !m.read_at).length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-[9px] text-white font-bold">
                    {conversationMessages.filter((m) => m.sender_type === 'client' && !m.read_at).length}
                  </span>
                )}
              </button>
            </div>

            {detailTab === 'details' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Name</p>
                    <p className="text-sm text-on-surface">{selected.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Status</p>
                    <Badge variant={statusColorMap[selected.status] ?? 'neutral'} size="sm">
                      {CONSULTATION_STATUS_LABELS[selected.status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Date</p>
                    <p className="text-sm text-on-surface">{format(new Date(selected.consultation_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Time</p>
                    <p className="text-sm text-on-surface">{selected.consultation_time}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm text-on-surface">{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-sm text-on-surface">{selected.phone}</p>
                  </div>
                </div>
                {selected.notes && (
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Notes</p>
                    <p className="text-sm text-on-surface-variant">{selected.notes}</p>
                  </div>
                )}
                {links.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5">Resources &amp; Links</p>
                    <div className="space-y-1.5">
                      {links.map((link) => (
                        <div key={link.id} className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2">
                          <Link2 size={14} className="text-primary shrink-0" />
                          <span className="flex-1 text-xs text-on-surface truncate">
                            {link.label || link.url}
                          </span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors shrink-0"
                            aria-label={`Open ${link.url}`}
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(link.url);
                              addToast('Link copied');
                            }}
                            className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
                            aria-label="Copy link"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteLink(link)}
                            className="text-on-surface-variant hover:text-error transition-colors shrink-0"
                            aria-label="Delete link"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {linksLoading && (
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant/60">
                    <Loader2 size={12} className="animate-spin" /> Loading links...
                  </div>
                )}
                {attachments.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5">Attachments</p>
                    <div className="space-y-1.5">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2">
                          {att.mime_type.startsWith('image/') ? (
                            <ImageIcon size={14} className="text-primary shrink-0" />
                          ) : (
                            <FileText size={14} className="text-primary shrink-0" />
                          )}
                          <span className="flex-1 text-xs text-on-surface truncate">{att.file_name}</span>
                          <span className="text-[10px] text-on-surface-variant/60 shrink-0">
                            {(att.file_size / 1024 / 1024).toFixed(1)} MB
                          </span>
                          <a
                            href={getAttachmentUrl(att.file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                            aria-label={`Download ${att.file_name}`}
                          >
                            <Download size={14} />
                          </a>
                          <button
                            onClick={() => setConfirmDeleteAttachment(att)}
                            className="text-on-surface-variant hover:text-error transition-colors"
                            aria-label={`Delete ${att.file_name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {attachmentsLoading && (
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant/60">
                    <Loader2 size={12} className="animate-spin" /> Loading attachments...
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t border-outline/20">
                  <Button size="sm" variant="outline" onClick={() => startEditing(selected)}>
                    <Edit3 size={14} />
                    Edit
                  </Button>
                  {selected.status !== 'completed' && selected.status !== 'cancelled' && selected.status !== 'no_show' && (
                    <>
                      {selected.status === 'pending' && (
                        <Button size="sm" variant="primary" onClick={() => handleStatusUpdate(selected.id, 'confirmed', 'confirmed')}>
                          <CheckCircle size={14} />
                          Confirm
                        </Button>
                      )}
                      <Button size="sm" variant="primary" onClick={() => handleStatusUpdate(selected.id, 'completed', 'completed')}>
                        <CheckCircle size={14} />
                        Mark Completed
                      </Button>
                      <Button size="sm" variant="ghost" className="text-error" onClick={() => handleStatusUpdate(selected.id, 'cancelled', 'cancelled')}>
                        <XCircle size={14} />
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" className="text-error ml-auto" onClick={() => setConfirmDelete({ id: selected.id, label: selected.property_name })}>
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {detailTab === 'messages' && (
              <div className="space-y-3">
                {conversationLoading ? (
                  <div className="flex items-center justify-center py-8 text-xs text-on-surface-variant/60">
                    <Loader2 size={14} className="animate-spin mr-2" /> Loading messages...
                  </div>
                ) : conversationMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-on-surface-variant/60">No messages yet. Start the conversation.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {conversationMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                          msg.sender_type === 'admin'
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-surface-container text-on-surface rounded-bl-sm'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <div className={`flex items-center gap-1 mt-0.5 ${
                            msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className={`text-[9px] ${msg.sender_type === 'admin' ? 'text-white/70' : 'text-on-surface-variant/60'}`}>
                              {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                            </span>
                            {msg.sender_type === 'client' && msg.read_at && (
                              <span className="text-[9px] text-on-surface-variant/60">Read</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-outline/20">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={adminReplyText}
                    maxLength={2000}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendAdminReply(); } }}
                    className="flex-1 bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/40 transition-shadow"
                  />
                  <Button size="sm" variant="primary" onClick={handleSendAdminReply} disabled={sendingAdminReply || !adminReplyText.trim()}>
                    {sendingAdminReply ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        {selected && editing && (
          <>
            <DialogHeader>
              <DialogTitle>Edit Consultation</DialogTitle>
              <DialogDescription>{selected.property_name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Name</p>
                  <Input value={editForm.name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, name: sanitize(e.target.value) }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
                  <Select options={STATUS_CHOICES} value={editForm.status ?? selected.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as Consultation['status'] }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Date</p>
                  <Input type="date" value={editForm.consultation_date ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, consultation_date: e.target.value }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Time</p>
                  <Input type="time" value={editForm.consultation_time ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, consultation_time: e.target.value }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Email</p>
                  <Input type="email" value={editForm.email ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Phone</p>
                  <Input type="tel" value={editForm.phone ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Property</p>
                  <Input value={editForm.property_name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, property_name: sanitize(e.target.value) }))} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Notes</p>
                <Textarea rows={3} value={editForm.notes ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, notes: sanitize(e.target.value) }))} />
              </div>
              <div className="flex gap-2 pt-2 border-t border-outline/20">
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </>
        )}
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogHeader>
          <DialogTitle>Delete Consultation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{confirmDelete?.label}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Dialog>

      <Dialog open={!!confirmDeleteAttachment} onClose={() => setConfirmDeleteAttachment(null)}>
        <DialogHeader>
          <DialogTitle>Delete Attachment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{confirmDeleteAttachment?.file_name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={() => setConfirmDeleteAttachment(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteAttachment}>Delete</Button>
        </div>
      </Dialog>

      <Dialog open={!!confirmDeleteLink} onClose={() => setConfirmDeleteLink(null)}>
        <DialogHeader>
          <DialogTitle>Delete Resource Link</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{confirmDeleteLink?.label || confirmDeleteLink?.url}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={() => setConfirmDeleteLink(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteLink}>Delete</Button>
        </div>
      </Dialog>
    </div>
  );
}
