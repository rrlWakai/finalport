import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  Clock,
  ChevronRight,
  Search,
  ArrowUpDown,
  UserCheck,
  TrendingUp,
  XCircle,
  MessageSquare,
  CalendarCheck,
  FileText,
  Send,
  MoveRight,
  Award,
  Loader2,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { ErrorState } from '../components/ErrorState';
import {
  getConsultations,
  getLeads,
  getActivityLogs,
  subscribeToTableChanges,
} from '../data/service';
import { CONSULTATION_STATUS_LABELS, STAGE_LABELS, type Consultation, type Lead, type ActivityLog } from '../data/schema';

function Greeting() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mb-8">
      <h1 className="font-display-xl text-2xl font-semibold text-on-surface">
        {greeting}, Rhen{' '}
        <span className="inline-block origin-hand animate-wave">👋</span>
      </h1>
      <p className="font-body-md text-sm text-on-surface-variant mt-1">
        Here&apos;s what&apos;s happening with your consultations.
      </p>
    </div>
  );
}

function TodaySchedule({ consultations, loading }: { consultations: Consultation[]; loading: boolean }) {
  const today = new Date().toISOString().split('T')[0];
  const todayConsults = consultations.filter(
    (c) => c.consultation_date === today && c.status !== 'cancelled',
  );
  todayConsults.sort((a, b) => {
    if (a.consultation_time < b.consultation_time) return -1;
    if (a.consultation_time > b.consultation_time) return 1;
    return 0;
  });

  return (
    <section className="mb-10">
      <h2 className="font-display-xl text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
        <Clock size={16} className="text-primary" />
        Today&apos;s Schedule
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-sm text-on-surface-variant/60">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading schedule...
        </div>
      ) : todayConsults.length === 0 ? (
        <div className="py-8 text-center text-sm text-on-surface-variant/60 rounded-xl border border-dashed border-outline/40">
          No consultations scheduled for today.
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-outline/30" />
          <div className="space-y-0">
            {todayConsults.map((consult) => (
              <div key={consult.id} className="flex gap-4 py-3">
                <div className="flex flex-col items-center shrink-0 w-14 pt-0.5">
                  <span className="font-body-md text-xs font-medium text-on-surface-variant">
                    {consult.consultation_time}
                  </span>
                </div>
                <div className="relative pl-4 flex-1">
                  <div
                    className={`absolute left-0 top-2 w-2.5 h-2.5 rounded-full border-2 ${
                      consult.status === 'confirmed'
                        ? 'bg-emerald-500 border-emerald-200'
                        : 'bg-amber-400 border-amber-200'
                    }`}
                  />
                  <div className="bg-surface border border-outline/30 rounded-xl p-3 hover:border-outline/60 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-body-md text-sm font-medium text-on-surface">
                          {consult.property_name}
                        </p>
                        <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                          {consult.name}
                        </p>
                      </div>
                      <Badge
                        variant={
                          consult.status === 'confirmed' ? 'success' : 'warning'
                        }
                        size="sm"
                      >
                        {CONSULTATION_STATUS_LABELS[consult.status]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PipelineOverview({ leads, loading }: { leads: Lead[]; loading: boolean }) {
  const stages = [
    { key: 'new_inquiry' as const, icon: MessageSquare, label: 'New Inquiry' },
    { key: 'discovery_scheduled' as const, icon: CalendarCheck, label: 'Discovery Scheduled' },
    { key: 'proposal_sent' as const, icon: FileText, label: 'Proposal Sent' },
    { key: 'negotiation' as const, icon: Send, label: 'Negotiation' },
    { key: 'won' as const, icon: Award, label: 'Won' },
    { key: 'lost' as const, icon: XCircle, label: 'Lost' },
  ];

  return (
    <section className="mb-10">
      <h2 className="font-display-xl text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-primary" />
        Pipeline Overview
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-sm text-on-surface-variant/60">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading pipeline...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.key);
            const revenue = stageLeads.reduce((sum, l) => {
              const num = parseInt(l.budget.replace(/[^0-9]/g, ''), 10);
              return sum + (isNaN(num) ? 0 : num);
            }, 0);

            return (
              <div
                key={stage.key}
                className="rounded-xl border border-outline/30 bg-surface p-3.5 hover:border-outline/60 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <stage.icon size={13} className="text-on-surface-variant" />
                  <span className="font-body-md text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">
                    {stage.label}
                  </span>
                </div>
                <p className="font-display-xl text-2xl font-semibold text-on-surface">
                  {stageLeads.length}
                </p>
                {revenue > 0 && (
                  <p className="font-body-md text-xs font-medium text-on-surface-variant mt-1">
                    ₱{(revenue / 1000).toFixed(0)}k
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RecentInquiries({ leads, loading }: { leads: Lead[]; loading: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columnHelper = createColumnHelper<Lead>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('property_name', {
        header: 'Property',
        cell: (info) => (
          <span className="font-medium text-on-surface text-sm">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('location', {
        header: 'Location',
        cell: (info) => (
          <span className="text-sm text-on-surface-variant">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('source', {
        header: 'Source',
        cell: (info) => (
          <Badge variant="default" size="sm">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('stage', {
        header: 'Status',
        cell: (info) => (
          <Badge variant={info.getValue() === 'new_inquiry' ? 'info' : 'warning'} size="sm">
            {STAGE_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Created',
        cell: (info) => (
          <span className="text-sm text-on-surface-variant">
            {format(new Date(info.getValue()), 'MMM d, yyyy')}
          </span>
        ),
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    data: leads,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display-xl text-sm font-semibold text-on-surface flex items-center gap-2">
          <UserCheck size={16} className="text-primary" />
          Recent Inquiries
        </h2>
        <div className="relative w-56">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
          />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-outline/30 bg-surface text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-sm text-on-surface-variant/60 rounded-xl border border-dashed border-outline/40">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading inquiries...
        </div>
      ) : leads.length === 0 ? (
        <div className="py-12 text-center text-sm text-on-surface-variant/60 rounded-xl border border-dashed border-outline/40">
          No inquiries yet. Share your portfolio to start receiving leads.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline/30">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-outline/20">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2.5 text-left text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wider cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown size={11} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-outline/10 hover:bg-surface-container/40 transition-colors last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ActivityFeed({ logs, loading }: { logs: ActivityLog[]; loading: boolean }) {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const getIcon = (action: string) => {
    if (action.includes('booked') || action.includes('confirmed'))
      return <CalendarCheck size={14} className="text-emerald-500" />;
    if (action.includes('Proposal') || action.includes('proposal'))
      return <FileText size={14} className="text-violet-500" />;
    if (action.includes('Lead') || action.includes('moved'))
      return <MoveRight size={14} className="text-amber-500" />;
    if (action.includes('Won') || action.includes('won'))
      return <Award size={14} className="text-emerald-500" />;
    if (action.includes('Contract'))
      return <Send size={14} className="text-blue-500" />;
    if (action.includes('inquiry') || action.includes('Inquiry'))
      return <MessageSquare size={14} className="text-primary" />;
    return <ChevronRight size={14} className="text-on-surface-variant" />;
  };

  return (
    <section className="mb-10">
      <h2 className="font-display-xl text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
        <Clock size={16} className="text-primary" />
        Activity Feed
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-sm text-on-surface-variant/60 rounded-xl border border-dashed border-outline/40">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading activity...
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-8 text-center text-sm text-on-surface-variant/60 rounded-xl border border-dashed border-outline/40">
          No activity yet.
        </div>
      ) : (
        <div className="rounded-xl border border-outline/30 bg-surface divide-y divide-outline/10">
          {sorted.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container/40 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                {getIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-sm text-on-surface truncate">
                  {log.action}
                </p>
              </div>
              <span className="font-body-md text-xs text-on-surface-variant/50 shrink-0">
                {format(new Date(log.created_at), 'h:mm a')}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function Overview() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [consults, leadData, activity] = await Promise.all([
        getConsultations(),
        getLeads(),
        getActivityLogs(),
      ]);
      setConsultations(consults);
      setLeads(leadData);
      setLogs(activity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsub1 = subscribeToTableChanges('consultations', {
      onInsert: (p) => {
        const record = p.new as unknown as Consultation;
        if (record) setConsultations((prev) => [...prev, record]);
      },
      onUpdate: (p) => {
        const record = p.new as unknown as Consultation;
        if (record?.id) setConsultations((prev) => prev.map((c) => c.id === record.id ? record : c));
      },
      onDelete: (p) => {
        const old = p.old as unknown as Consultation;
        if (old?.id) setConsultations((prev) => prev.filter((c) => c.id !== old.id));
      },
    });
    const unsub2 = subscribeToTableChanges('leads', {
      onInsert: (p) => {
        const record = p.new as unknown as Lead;
        if (record) setLeads((prev) => [record, ...prev]);
      },
      onUpdate: (p) => {
        const record = p.new as unknown as Lead;
        if (record?.id) setLeads((prev) => prev.map((l) => l.id === record.id ? record : l));
      },
      onDelete: (p) => {
        const old = p.old as unknown as Lead;
        if (old?.id) setLeads((prev) => prev.filter((l) => l.id !== old.id));
      },
    });
    const unsub3 = subscribeToTableChanges('activity_logs', {
      onInsert: (p) => {
        const record = p.new as unknown as ActivityLog;
        if (record) setLogs((prev) => [record, ...prev].slice(0, 50));
      },
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  if (error && !loading) {
    return (
      <div>
        <Greeting />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div>
      <Greeting />
      <TodaySchedule consultations={consultations} loading={loading} />
      <PipelineOverview leads={leads} loading={loading} />
      <RecentInquiries leads={leads} loading={loading} />
      <ActivityFeed logs={logs} loading={loading} />
    </div>
  );
}
