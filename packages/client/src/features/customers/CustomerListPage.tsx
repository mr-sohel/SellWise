import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomers, useRecalculateRFM } from './hooks/useCustomers';
import { useAuthStore } from '../../stores/auth.store';
import { Search, AlertTriangle, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/ui/page-header';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { RFM_SEGMENTS, RFM_SEGMENT_LABELS, RFM_SEGMENT_COLORS } from '@sellwise/shared';
import type { RfmSegment } from '@sellwise/shared';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from 'sonner';

export function CustomerListPage() {
  const { t } = useTranslation();
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [segmentFilter, setSegmentFilter] = useState<RfmSegment | ''>('');

  const { data: result, isLoading } = useCustomers(storeId, {
    page,
    limit: 10,
    search: debouncedSearch,
    segment: segmentFilter || undefined,
  });

  const recalculateMutation = useRecalculateRFM(storeId);

  const handleRecalculate = async () => {
    try {
      await recalculateMutation.mutateAsync();
      toast.success('RFM recalculation queued. Segments will update shortly.');
    } catch {
      toast.error('Failed to trigger RFM recalculation');
    }
  };

  const formatSegment = (segment?: string) => {
    if (!segment) return 'Uncategorized';
    return segment.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="w-full space-y-6 max-w-[1600px] mx-auto pb-8">
      <PageHeader
        title={t('common.customers')}
        action={
          <button
            onClick={handleRecalculate}
            disabled={recalculateMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border bg-card text-foreground rounded-full text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
            Recalculate RFM
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-full shadow-vercel-1 w-full sm:max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={segmentFilter}
          onChange={(e) => {
            setSegmentFilter(e.target.value as RfmSegment | '');
            setPage(1);
          }}
          className="px-4 py-2.5 bg-card border border-border rounded-full shadow-vercel-1 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none min-w-[160px]"
        >
          <option value="">All Segments</option>
          {RFM_SEGMENTS.map((seg) => (
            <option key={seg} value={seg}>
              {RFM_SEGMENT_LABELS[seg]}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-vercel-2 overflow-hidden w-full">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : result?.data.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-base font-medium text-foreground">No customers found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-base min-w-[600px]">
              <thead className="bg-canvas-soft/50 border-b border-border">
                <tr>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Name</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Contact</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Orders</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Segment (RFM)</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((customer) => (
                  <tr key={customer.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="px-6 sm:px-8 py-5 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {customer.name}
                        {customer.churn_probability != null && customer.churn_probability > 0.7 && (
                          <div className="group relative flex items-center">
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-primary text-primary-foreground text-xs rounded-lg px-2.5 py-1 shadow-vercel-5 whitespace-nowrap z-10">
                              High Churn Risk ({Math.round(customer.churn_probability * 100)}%)
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 sm:px-8 py-5 text-muted-foreground">
                      <div>{customer.phone}</div>
                      {customer.email && <div className="text-xs">{customer.email}</div>}
                    </td>
                    <td className="px-6 sm:px-8 py-5 text-foreground">{customer.total_orders}</td>
                    <td className="px-6 sm:px-8 py-5">
                      {customer.segment ? (
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant={RFM_SEGMENT_COLORS[customer.segment as RfmSegment] || 'muted'}>
                            {formatSegment(customer.segment)}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            R:{customer.recency_score ?? '-'} F:{customer.frequency_score ?? '-'} M:{customer.monetary_score ?? '-'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 sm:px-8 py-5 text-right text-foreground font-medium whitespace-nowrap">৳{Number(customer.total_spent).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {result?.meta && result.meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, result.meta.totalCount)}</span> of <span className="font-medium text-foreground">{result.meta.totalCount}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium border border-border rounded-full hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= result.meta.totalPages}
              className="px-3 py-1.5 text-sm font-medium border border-border rounded-full hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
