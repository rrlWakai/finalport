import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Mail, Archive, CheckCheck, Loader2, Trash2, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { ErrorState } from '../components/ErrorState';
import {
  getMessagesPage,
  updateMessageStatus,
  deleteMessage,
  createActivityLog,
  subscribeToTableChanges,
} from '../data/service';
import { MESSAGE_STATUS_LABELS, type Message } from '../data/schema';
import { useToast } from '../../lib/toast';
import { sendReply } from '../../lib/email';

const PAGE_SIZE = 20;

export function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);
  const { addToast } = useToast();

  const loadData = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMessagesPage(p, PAGE_SIZE);
      setMessages(result.data);
      setTotalCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  useEffect(() => {
    const unsub = subscribeToTableChanges('messages', {
      onInsert: (payload) => {
        const record = payload.new as unknown as Message;
        if (record) setMessages((prev) => {
          const exists = prev.some((m) => m.id === record.id);
          return exists ? prev : [record, ...prev].slice(0, PAGE_SIZE);
        });
      },
      onUpdate: (payload) => {
        const record = payload.new as unknown as Message;
        if (record?.id) setMessages((prev) => prev.map((m) => m.id === record.id ? record : m));
      },
      onDelete: (payload) => {
        const old = payload.old as unknown as Message;
        if (old?.id) setMessages((prev) => prev.filter((m) => m.id !== old.id));
      },
    });
    return () => unsub();
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filtered = messages.filter((m) => {
    const match =
      m.sender_name.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase());
    return match;
  });

  const sorted = [...filtered].sort((a, b) => {
    const order = { unread: 0, read: 1, archived: 2, resolved: 3 };
    return order[a.status] - order[b.status];
  });

  const markRead = async (msg: Message) => {
    if (msg.status !== 'unread') return;
    await updateMessageStatus(msg.id, 'read');
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' as const } : m)),
    );
  };

  const toggleArchive = async (msg: Message) => {
    const newStatus = msg.status === 'archived' ? 'read' as const : 'archived' as const;
    await updateMessageStatus(msg.id, newStatus);
    await createActivityLog({
      action: `Message ${newStatus === 'archived' ? 'archived' : 'restored'} - ${msg.subject}`,
      entity_type: 'message',
      entity_id: msg.id,
    } as never);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: newStatus } : m)),
    );
    if (selected?.id === msg.id) {
      setSelected({ ...selected, status: newStatus });
    }
  };

  const markResolved = async (msg: Message) => {
    await updateMessageStatus(msg.id, 'resolved');
    await createActivityLog({
      action: `Message resolved - ${msg.subject}`,
      entity_type: 'message',
      entity_id: msg.id,
    } as never);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: 'resolved' as const } : m)),
    );
    if (selected?.id === msg.id) {
      setSelected({ ...selected, status: 'resolved' });
    }
  };

  const handleSendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const result = await sendReply(
        selected.email,
        selected.subject,
        `<p>${replyText.replace(/\n/g, '<br>')}</p>`,
      );
      await createActivityLog({
        action: `Reply sent to ${selected.sender_name} - ${selected.subject}`,
        entity_type: 'message',
        entity_id: selected.id,
      } as never);
      await updateMessageStatus(selected.id, 'read');
      setMessages((prev) =>
        prev.map((m) => m.id === selected.id ? { ...m, status: 'read' as const } : m),
      );
      setReplyText('');
      addToast(result ? 'Reply sent successfully' : 'Send-email function not deployed');
    } catch (err) {
      await createActivityLog({
        action: `Reply failed to ${selected!.sender_name} - ${selected!.subject}`,
        entity_type: 'message',
        entity_id: selected!.id,
      } as never).catch(() => {});
      addToast('Failed to send reply', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMessage(confirmDelete.id);
      await createActivityLog({
        action: `Message deleted - ${confirmDelete.label}`,
        entity_type: 'message',
        entity_id: confirmDelete.id,
      } as never);
      setMessages((prev) => prev.filter((m) => m.id !== confirmDelete.id));
      setTotalCount((c) => Math.max(0, c - 1));
      if (selected?.id === confirmDelete.id) setSelected(null);
      setConfirmDelete(null);
      addToast('Message deleted');
    } catch {
      addToast('Failed to delete message', 'error');
    }
  };

  const openMessage = (msg: Message) => {
    if (msg.status === 'unread') markRead(msg);
    setSelected(msg);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-xl text-xl font-semibold text-on-surface">
          Messages
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant">
            {messages.filter((m) => m.status === 'unread').length} unread
          </span>
        </div>
      </div>

      <div className="relative w-56 mb-4">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="w-full h-8 pl-8 pr-3 rounded-lg border border-outline/30 bg-surface text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-on-surface-variant/60">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading messages...
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(page)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-0 lg:gap-6">
          <div className="rounded-xl border border-outline/30 bg-surface divide-y divide-outline/10 max-h-[600px] overflow-y-auto">
            {sorted.length === 0 ? (
              <div className="py-12 text-center text-sm text-on-surface-variant/60">
                {messages.length === 0
                  ? 'No messages yet.'
                  : 'No messages match your search.'}
              </div>
            ) : (
              sorted.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`px-4 py-3 cursor-pointer hover:bg-surface-container/40 transition-colors ${
                    msg.status === 'unread' ? 'bg-primary/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">
                        {msg.sender_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-body-md text-sm truncate ${
                            msg.status === 'unread'
                              ? 'font-semibold text-on-surface'
                              : 'text-on-surface'
                          }`}
                        >
                          {msg.sender_name}
                        </span>
                        {msg.status === 'unread' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                        <span className="ml-auto text-[10px] text-on-surface-variant/50 shrink-0">
                          {format(new Date(msg.created_at), 'MMM d')}
                        </span>
                      </div>
                      <p
                        className={`font-body-md text-xs mt-0.5 truncate ${
                          msg.status === 'unread'
                            ? 'text-on-surface'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {msg.subject}
                      </p>
                      <p className="font-body-md text-xs text-on-surface-variant/60 truncate mt-0.5">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden lg:block">
            {selected ? (
              <div className="rounded-xl border border-outline/30 bg-surface p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display-xl text-sm font-semibold text-on-surface">
                      {selected.sender_name}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {selected.email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      selected.status === 'unread'
                        ? 'info'
                        : selected.status === 'resolved'
                          ? 'success'
                          : 'default'
                    }
                    size="sm"
                  >
                    {MESSAGE_STATUS_LABELS[selected.status]}
                  </Badge>
                </div>
                <h4 className="font-body-md text-sm font-medium text-on-surface mb-2">
                  {selected.subject}
                </h4>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4">
                  {selected.message}
                </p>
                <p className="text-xs text-on-surface-variant/50 mb-4">
                  Received{' '}
                  {format(new Date(selected.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                <div className="border-t border-outline/20 pt-4">
                  <p className="text-xs font-medium text-on-surface-variant mb-2">
                    Reply
                  </p>
                  <Textarea
                    placeholder="Type your reply..."
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={handleSendReply} disabled={sendingReply || !replyText.trim()}>
                      <Send size={14} />
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markResolved(selected)}
                    >
                      <CheckCheck size={14} />
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleArchive(selected)}
                    >
                      <Archive size={14} />
                      {selected.status === 'archived' ? 'Restore' : 'Archive'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-error ml-auto"
                      onClick={() => setConfirmDelete({ id: selected.id, label: selected.subject })}
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-outline/30 bg-surface p-8 text-center">
                <Mail size={24} className="mx-auto text-on-surface-variant/30 mb-2" />
                <p className="text-sm text-on-surface-variant/60">
                  Select a message to read
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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

      <Dialog open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <DialogHeader>
              <DialogTitle>{selected.sender_name}</DialogTitle>
              <DialogDescription>{selected.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <h4 className="font-body-md text-sm font-medium text-on-surface">
                {selected.subject}
              </h4>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                {selected.message}
              </p>
              <p className="text-xs text-on-surface-variant/50">
                Received{' '}
                {format(new Date(selected.created_at), 'MMM d, yyyy h:mm a')}
              </p>
              <div className="border-t border-outline/20 pt-4">
                <Textarea
                  placeholder="Type your reply..."
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleSendReply} disabled={sendingReply || !replyText.trim()}>
                    <Send size={14} />
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markResolved(selected)}
                  >
                    <CheckCheck size={14} />
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleArchive(selected)}
                  >
                    <Archive size={14} />
                    {selected.status === 'archived' ? 'Restore' : 'Archive'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-error ml-auto"
                    onClick={() => setConfirmDelete({ id: selected.id, label: selected.subject })}
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogHeader>
          <DialogTitle>Delete Message</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{confirmDelete?.label}"? This action cannot be undone.
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
