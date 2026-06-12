import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Loader2, Trash2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { ErrorState } from '../components/ErrorState';
import {
  getLeadsPage,
  createLead,
  updateLead,
  deleteLead,
  createActivityLog,
  subscribeToTableChanges,
  sanitize,
} from '../data/service';
import { STAGE_LABELS, type Lead } from '../data/schema';
import { format } from 'date-fns';
import { useToast } from '../../lib/toast';

const PAGE_SIZE = 20;

const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  ...Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label })),
];

const STAGE_CHOICES = Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }));

const PIPELINE_STAGES = [
  'new_inquiry',
  'discovery_scheduled',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
] as const;

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    property_name: '',
    email: '',
    phone: '',
    location: '',
    source: '',
    challenge: '',
  });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);
  const { addToast } = useToast();

  const loadData = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeadsPage(p, PAGE_SIZE);
      setLeads(result.data);
      setTotalCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  useEffect(() => {
    const unsub = subscribeToTableChanges('leads', {
      onInsert: (payload) => {
        const record = payload.new as unknown as Lead;
        if (record) setLeads((prev) => {
          const exists = prev.some((l) => l.id === record.id);
          return exists ? prev : [record, ...prev].slice(0, PAGE_SIZE);
        });
      },
      onUpdate: (payload) => {
        const record = payload.new as unknown as Lead;
        if (record?.id) setLeads((prev) => prev.map((l) => l.id === record.id ? record : l));
      },
      onDelete: (payload) => {
        const old = payload.old as unknown as Lead;
        if (old?.id) setLeads((prev) => prev.filter((l) => l.id !== old.id));
      },
    });
    return () => unsub();
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.property_name.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !stageFilter || l.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const groupedByStage = PIPELINE_STAGES.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    leads: leads.filter((l) => l.stage === stage),
  }));

  const moveStage = async (leadId: string, newStage: Lead['stage']) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;
    await updateLead(leadId, { stage: newStage } as never);
    await createActivityLog({
      action: `Lead moved to ${STAGE_LABELS[newStage]} - ${lead.property_name}`,
      entity_type: 'lead',
      entity_id: leadId,
    } as never);
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, stage: newStage } : l));
    if (selected?.id === leadId) {
      setSelected({ ...selected, stage: newStage });
    }
    addToast(`Lead moved to ${STAGE_LABELS[newStage]}`);
  };

  const handleCreateLead = async () => {
    if (!newLead.name.trim() || !newLead.property_name.trim() || !newLead.email.trim()) return;
    setSaving(true);
    try {
      const result = await createLead({
        name: sanitize(newLead.name.trim()),
        property_name: sanitize(newLead.property_name.trim()),
        email: newLead.email.trim(),
        phone: newLead.phone.trim(),
        location: sanitize(newLead.location.trim()),
        challenge: sanitize(newLead.challenge.trim()),
        budget: '',
        source: newLead.source || 'Manual Entry',
        stage: 'new_inquiry',
        notes: '',
      } as never);
      if (result) {
        await createActivityLog({
          action: `Lead created - ${result.property_name}`,
          entity_type: 'lead',
          entity_id: result.id,
        } as never);
        setLeads((prev) => [result as Lead, ...prev].slice(0, PAGE_SIZE));
        setTotalCount((c) => c + 1);
      }
      setShowNewLead(false);
      setNewLead({ name: '', property_name: '', email: '', phone: '', location: '', source: '', challenge: '' });
      addToast('Lead created');
    } catch {
      addToast('Failed to create lead', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (lead: Lead) => {
    setEditForm({
      name: lead.name,
      property_name: lead.property_name,
      email: lead.email,
      phone: lead.phone,
      location: lead.location,
      budget: lead.budget,
      challenge: lead.challenge,
      notes: lead.notes,
      stage: lead.stage,
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateLead(selected.id, editForm as never);
      await createActivityLog({
        action: `Lead updated - ${editForm.property_name ?? selected.property_name}`,
        entity_type: 'lead',
        entity_id: selected.id,
      } as never);
      setEditing(false);
      setSelected((prev) => prev ? { ...prev, ...editForm } as Lead : null);
      setLeads((prev) =>
        prev.map((l) => l.id === selected.id ? { ...l, ...editForm } as Lead : l),
      );
      addToast('Lead updated');
    } catch {
      addToast('Failed to update lead', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteLead(confirmDelete.id);
      await createActivityLog({
        action: `Lead deleted - ${confirmDelete.label}`,
        entity_type: 'lead',
        entity_id: confirmDelete.id,
      } as never);
      setConfirmDelete(null);
      setSelected(null);
      setLeads((prev) => prev.filter((l) => l.id !== confirmDelete.id));
      setTotalCount((c) => Math.max(0, c - 1));
      addToast('Lead deleted');
    } catch {
      addToast('Failed to delete lead', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-xl text-xl font-semibold text-on-surface">
          Leads & Pipeline
        </h1>
        <Button size="sm" onClick={() => setShowNewLead(true)}>
          <Plus size={14} />
          Add Lead
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-on-surface-variant/60">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading leads...
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(page)} />
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
            {groupedByStage.map(({ stage, label, leads: stageLeads }) => (
              <div
                key={stage}
                className="shrink-0 w-48 rounded-xl border border-outline/30 bg-surface p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body-md text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">
                    {label}
                  </span>
                  <span className="font-display-xl text-sm font-semibold text-on-surface">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {stageLeads.length === 0 ? (
                    <p className="text-[10px] text-on-surface-variant/40 text-center py-3">
                      No leads
                    </p>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-lg border border-outline/20 bg-surface p-2.5 cursor-pointer hover:border-outline/60 transition-colors"
                        onClick={() => { setSelected(lead); setEditing(false); }}
                      >
                        <p className="font-body-md text-xs font-medium text-on-surface truncate">
                          {lead.property_name}
                        </p>
                        <p className="font-body-md text-[10px] text-on-surface-variant truncate mt-0.5">
                          {lead.name}
                        </p>
                        {lead.budget && (
                          <p className="font-body-md text-[10px] text-primary mt-1">
                            {lead.budget}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-48">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-outline/30 bg-surface text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <Select
              options={STAGE_OPTIONS}
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-40 h-8 text-xs"
            />
          </div>

          <div className="rounded-xl border border-outline/30 bg-surface divide-y divide-outline/10">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-on-surface-variant/60">
                {leads.length === 0
                  ? 'No leads yet. Share your portfolio to start receiving inquiries.'
                  : 'No leads match your filters.'}
              </div>
            ) : (
              filtered.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container/40 transition-colors cursor-pointer"
                  onClick={() => { setSelected(lead); setEditing(false); }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {lead.property_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-sm font-medium text-on-surface truncate">
                      {lead.property_name}
                    </p>
                    <p className="font-body-md text-xs text-on-surface-variant">
                      {lead.name} — {lead.location}
                    </p>
                  </div>
                  <Badge
                    variant={
                      lead.stage === 'new_inquiry'
                        ? 'info'
                        : lead.stage === 'won'
                          ? 'success'
                          : lead.stage === 'lost'
                            ? 'neutral'
                            : 'warning'
                    }
                    size="sm"
                  >
                    {STAGE_LABELS[lead.stage]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(lead);
                      setEditing(false);
                    }}
                  >
                    <Eye size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
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

      <Dialog open={!!selected} onClose={() => { setSelected(null); setEditing(false); }}>
        {selected && !editing && (
          <>
            <DialogHeader>
              <DialogTitle>{selected.property_name}</DialogTitle>
              <DialogDescription>
                Lead from {selected.source} — Created{' '}
                {format(new Date(selected.created_at), 'MMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Contact</p>
                  <p className="text-sm text-on-surface">{selected.name}</p>
                  <p className="text-xs text-on-surface-variant">{selected.email}</p>
                  <p className="text-xs text-on-surface-variant">{selected.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Stage</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {PIPELINE_STAGES.map((s) => (
                      <button
                        key={s}
                        onClick={() => moveStage(selected.id, s)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                          selected.stage === s
                            ? 'bg-primary text-on-primary border-primary'
                            : 'border-outline/40 text-on-surface-variant hover:border-primary/40'
                        }`}
                      >
                        {STAGE_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Location</p>
                  <p className="text-sm text-on-surface">{selected.location}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Budget</p>
                  <p className="text-sm text-primary font-medium">{selected.budget}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Challenge</p>
                  <p className="text-sm text-on-surface-variant">{selected.challenge}</p>
                </div>
              </div>
              {selected.notes && (
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-0.5">Notes</p>
                  <p className="text-sm text-on-surface-variant">{selected.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-outline/20">
                <Button size="sm" variant="outline" onClick={() => startEditing(selected)}>
                  <Edit3 size={14} />
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-error ml-auto" onClick={() => setConfirmDelete({ id: selected.id, label: selected.property_name })}>
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
        {selected && editing && (
          <>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
              <DialogDescription>{selected.property_name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Name</p>
                  <Input value={editForm.name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, name: sanitize(e.target.value) }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Stage</p>
                  <Select options={STAGE_CHOICES} value={editForm.stage ?? selected.stage} onChange={(e) => setEditForm((p) => ({ ...p, stage: e.target.value as Lead['stage'] }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Email</p>
                  <Input type="email" value={editForm.email ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Phone</p>
                  <Input type="tel" value={editForm.phone ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Location</p>
                  <Input value={editForm.location ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, location: sanitize(e.target.value) }))} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Budget</p>
                  <Input value={editForm.budget ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, budget: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Property</p>
                  <Input value={editForm.property_name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, property_name: sanitize(e.target.value) }))} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Challenge</p>
                <Textarea rows={2} value={editForm.challenge ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, challenge: sanitize(e.target.value) }))} />
              </div>
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Notes</p>
                <Textarea rows={2} value={editForm.notes ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, notes: sanitize(e.target.value) }))} />
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

      <Dialog open={showNewLead} onClose={() => setShowNewLead(false)}>
        <DialogHeader>
          <DialogTitle>New Lead</DialogTitle>
          <DialogDescription>Add a new lead to your pipeline.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Full Name *"
            value={newLead.name}
            onChange={(e) => setNewLead((p) => ({ ...p, name: sanitize(e.target.value) }))}
          />
          <Input
            placeholder="Property Name *"
            value={newLead.property_name}
            onChange={(e) => setNewLead((p) => ({ ...p, property_name: sanitize(e.target.value) }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Email *"
              type="email"
              value={newLead.email}
              onChange={(e) => setNewLead((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              placeholder="Phone"
              type="tel"
              value={newLead.phone}
              onChange={(e) => setNewLead((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <Input
            placeholder="Location"
            value={newLead.location}
            onChange={(e) => setNewLead((p) => ({ ...p, location: sanitize(e.target.value) }))}
          />
          <Select
            options={[
              { value: '', label: 'Select source...' },
              { value: 'Website', label: 'Website' },
              { value: 'Referral', label: 'Referral' },
              { value: 'LinkedIn', label: 'LinkedIn' },
              { value: 'Facebook', label: 'Facebook' },
              { value: 'Google Search', label: 'Google Search' },
              { value: 'Email Campaign', label: 'Email Campaign' },
              { value: 'Manual Entry', label: 'Manual Entry' },
            ]}
            value={newLead.source}
            onChange={(e) => setNewLead((p) => ({ ...p, source: e.target.value }))}
            placeholder="Source"
          />
          <Textarea
            placeholder="Brief description of their challenge..."
            rows={2}
            value={newLead.challenge}
            onChange={(e) => setNewLead((p) => ({ ...p, challenge: sanitize(e.target.value) }))}
          />
          <Button className="w-full" onClick={handleCreateLead} disabled={saving}>
            {saving ? 'Saving...' : 'Add Lead'}
          </Button>
        </div>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogHeader>
          <DialogTitle>Delete Lead</DialogTitle>
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
