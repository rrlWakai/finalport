import { useState, useEffect } from 'react';
import { Plus, Edit3, Copy, Loader2, Trash2, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { ErrorState } from '../components/ErrorState';
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  createActivityLog,
  subscribeToTableChanges,
  sanitize,
} from '../data/service';
import { type EmailTemplate } from '../data/schema';
import { format } from 'date-fns';
import { useToast } from '../../lib/toast';
import { sendEmail, fillTemplate } from '../../lib/email';

export function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EmailTemplate>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);
  const [showSend, setShowSend] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [sendVars, setSendVars] = useState<Record<string, string>>({});
  const [sendingEmail, setSendingEmail] = useState(false);
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsub = subscribeToTableChanges('email_templates', {
      onInsert: (payload) => {
        const record = (payload as Record<string, unknown>).new as unknown as EmailTemplate;
        if (record) setTemplates((prev) => {
          const exists = prev.some((t) => t.id === record.id);
          return exists ? prev : [record, ...prev];
        });
      },
      onUpdate: (payload) => {
        const record = (payload as Record<string, unknown>).new as unknown as EmailTemplate;
        if (record?.id) setTemplates((prev) => prev.map((t) => t.id === record.id ? record : t));
      },
      onDelete: (payload) => {
        const old = (payload as Record<string, unknown>).old as unknown as EmailTemplate;
        if (old?.id) setTemplates((prev) => prev.filter((t) => t.id !== old.id));
      },
    });
    return () => unsub();
  }, []);

  const handleCreate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim() || !newTemplate.body.trim()) return;
    setSaving(true);
    try {
      const result = await createEmailTemplate({
        name: sanitize(newTemplate.name.trim()),
        subject: sanitize(newTemplate.subject.trim()),
        body: newTemplate.body.trim(),
      } as never);
      if (result) {
        await createActivityLog({
          action: `Email template created - ${result.name}`,
          entity_type: 'email_template',
          entity_id: result.id,
        } as never);
        setTemplates((prev) => [result as EmailTemplate, ...prev]);
      }
      setShowCreate(false);
      setNewTemplate({ name: '', subject: '', body: '' });
      addToast('Template created');
    } catch {
      addToast('Failed to create template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (tpl: EmailTemplate) => {
    setSaving(true);
    try {
      const result = await createEmailTemplate({
        name: `${tpl.name} (Copy)`,
        subject: tpl.subject,
        body: tpl.body,
      } as never);
      if (result) {
        await createActivityLog({
          action: `Email template duplicated - ${result.name}`,
          entity_type: 'email_template',
          entity_id: result.id,
        } as never);
        setTemplates((prev) => [result as EmailTemplate, ...prev]);
        addToast('Template duplicated');
      }
    } catch {
      addToast('Failed to duplicate template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (tpl: EmailTemplate) => {
    setEditForm({
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateEmailTemplate(selected.id, editForm as never);
      await createActivityLog({
        action: `Email template updated - ${editForm.name ?? selected.name}`,
        entity_type: 'email_template',
        entity_id: selected.id,
      } as never);
      setEditing(false);
      setSelected((prev) => prev ? { ...prev, ...editForm } as EmailTemplate : null);
      setTemplates((prev) =>
        prev.map((t) => t.id === selected.id ? { ...t, ...editForm } as EmailTemplate : t),
      );
      addToast('Template updated');
    } catch {
      addToast('Failed to update template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openSendDialog = (tpl: EmailTemplate) => {
    const vars: Record<string, string> = {};
    const re = /\{\{(\w+)\}\}/g;
    const text = tpl.subject + tpl.body;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const key = m[1];
      if (key && !(key in vars)) vars[key] = '';
    }
    setSendVars(vars);
    setSendTo('');
    setSelected(tpl);
    setShowSend(true);
  };

  const handleSendTemplate = async () => {
    if (!selected || !sendTo.trim()) return;
    setSendingEmail(true);
    try {
      const subject = fillTemplate(selected.subject, sendVars);
      const body = fillTemplate(selected.body, sendVars);
      const result = await sendEmail(sendTo, subject, `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">${body.replace(/\n/g, '<br>')}</div>`);
      await createActivityLog({
        action: `Email sent using template "${selected.name}" to ${sendTo}`,
        entity_type: 'email_template',
        entity_id: selected.id,
      } as never);
      setShowSend(false);
      addToast(result ? 'Email sent successfully' : 'Send-email function not deployed');
    } catch (err) {
      await createActivityLog({
        action: `Email send failed using template "${selected!.name}" to ${sendTo}`,
        entity_type: 'email_template',
        entity_id: selected!.id,
      } as never).catch(() => {});
      addToast('Failed to send email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteEmailTemplate(confirmDelete.id);
      await createActivityLog({
        action: `Email template deleted - ${confirmDelete.label}`,
        entity_type: 'email_template',
        entity_id: confirmDelete.id,
      } as never);
      setConfirmDelete(null);
      setSelected(null);
      setTemplates((prev) => prev.filter((t) => t.id !== confirmDelete.id));
      addToast('Template deleted');
    } catch {
      addToast('Failed to delete template', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-xl text-xl font-semibold text-on-surface">
          Email Templates
        </h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          Create Template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-on-surface-variant/60">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading templates...
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : templates.length === 0 ? (
        <div className="py-12 text-center text-sm text-on-surface-variant/60 rounded-xl border border-dashed border-outline/40">
          No email templates yet. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-outline/30 bg-surface p-4 hover:border-outline/60 transition-colors cursor-pointer"
              onClick={() => { setSelected(template); setEditing(false); }}
            >
              <h3 className="font-body-md text-sm font-medium text-on-surface mb-1">
                {template.name}
              </h3>
              <p className="font-body-md text-xs text-on-surface-variant truncate mb-3">
                {template.subject}
              </p>
              <p className="font-body-md text-xs text-on-surface-variant/60 line-clamp-3">
                {template.body}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline/10">
                <span className="text-[10px] text-on-surface-variant/50">
                  Created {format(new Date(template.created_at), 'MMM yyyy')}
                </span>
                <div className="flex gap-1">
                  <button
                    className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    onClick={(e) => { e.stopPropagation(); setSelected(template); setEditing(false); setTimeout(() => startEditing(template), 0); }}
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleDuplicate(template); }}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected && !editing} onClose={() => { setSelected(null); setEditing(false); }}>
        {selected && (
          <>
            <DialogHeader>
              <DialogTitle>{selected.name}</DialogTitle>
              <DialogDescription>
                Subject: {selected.subject}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Subject</p>
                <p className="text-sm text-on-surface">{selected.subject}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Body</p>
                <div className="rounded-xl bg-surface-container p-3">
                  <pre className="text-sm text-on-surface-variant whitespace-pre-wrap font-body-md">
                    {selected.body}
                  </pre>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-outline/20">
                <Button size="sm" variant="primary" onClick={() => startEditing(selected)}>
                  <Edit3 size={14} />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => openSendDialog(selected)}>
                  <Send size={14} />
                  Send
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDuplicate(selected)} disabled={saving}>
                  <Copy size={14} />
                  Duplicate
                </Button>
                <Button size="sm" variant="ghost" className="text-error ml-auto" onClick={() => setConfirmDelete({ id: selected.id, label: selected.name })}>
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </Dialog>

      <Dialog open={editing && !!selected} onClose={() => setEditing(false)}>
        {selected && (
          <>
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>{selected.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Name</p>
                <Input value={editForm.name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, name: sanitize(e.target.value) }))} />
              </div>
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Subject</p>
                <Input value={editForm.subject ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, subject: sanitize(e.target.value) }))} />
              </div>
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Body</p>
                <Textarea rows={6} value={editForm.body ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, body: e.target.value }))} />
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

      <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
        <DialogHeader>
          <DialogTitle>New Template</DialogTitle>
          <DialogDescription>
            Create an email template for consultations and follow-ups.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Template name"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate((p) => ({ ...p, name: sanitize(e.target.value) }))}
          />
          <Input
            placeholder="Subject line (use {{variable}} for dynamic content)"
            value={newTemplate.subject}
            onChange={(e) => setNewTemplate((p) => ({ ...p, subject: sanitize(e.target.value) }))}
          />
          <Textarea
            placeholder="Email body..."
            rows={6}
            value={newTemplate.body}
            onChange={(e) => setNewTemplate((p) => ({ ...p, body: e.target.value }))}
          />
          <Button className="w-full" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </Dialog>

      <Dialog open={showSend} onClose={() => setShowSend(false)}>
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            {selected?.name} &mdash; fill in the recipient and any template variables.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Recipient email" type="email" value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
          {Object.keys(sendVars).length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Template Variables</p>
              {Object.keys(sendVars).map((key) => (
                <Input key={key} placeholder={`{{${key}}}`} value={sendVars[key]} onChange={(e) => setSendVars((p) => ({ ...p, [key]: e.target.value }))} />
              ))}
            </div>
          )}
          <Button className="w-full" onClick={handleSendTemplate} disabled={sendingEmail || !sendTo.trim()}>
            {sendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogHeader>
          <DialogTitle>Delete Template</DialogTitle>
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
