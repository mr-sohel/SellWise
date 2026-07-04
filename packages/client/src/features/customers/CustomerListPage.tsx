import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomers } from './hooks/useCustomers';
import { useAuthStore } from '../../stores/auth.store';
import { Search, AlertTriangle } from 'lucide-react';

export function CustomerListPage() {
  const { t } = useTranslation();
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: result, isLoading } = useCustomers(storeId, { page, limit: 10, search });

  const getSegmentStyle = (segment?: string) => {
    switch (segment) {
      case 'champion': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'loyal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'potential': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'at_risk': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'lost': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatSegment = (segment?: string) => {
    if (!segment) return 'Uncategorized';
    return segment.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          {t('common.customers')}
        </h1>
      </div>

      <div className="flex items-center px-3 py-2 bg-card border border-border rounded-md shadow-sm w-full max-w-sm">
        <Search className="h-5 w-5 text-muted-foreground mr-2" />
        <input
          type="text"
          placeholder="Search by name, phone or email..."
          className="bg-transparent border-none outline-none w-full focus:ring-0 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card border border-border rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading customers...</div>
        ) : result?.data.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-foreground">No customers found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Orders</th>
                  <th className="px-6 py-4 font-medium">Segment (RFM)</th>
                  <th className="px-6 py-4 font-medium text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {customer.name}
                        {customer.churn_probability && customer.churn_probability > 0.7 && (
                          <div className="group relative flex items-center">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-md border border-border whitespace-nowrap z-10">
                              High Churn Risk ({Math.round(customer.churn_probability * 100)}%)
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div>{customer.phone}</div>
                      {customer.email && <div className="text-xs">{customer.email}</div>}
                    </td>
                    <td className="px-6 py-4 text-foreground">{customer.total_orders}</td>
                    <td className="px-6 py-4">
                      {customer.segment ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSegmentStyle(customer.segment)}`}>
                            {formatSegment(customer.segment)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            R:{customer.recency_score} F:{customer.frequency_score} M:{customer.monetary_score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground font-medium">৳{customer.total_spent.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {result?.meta && result.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, result.meta.totalCount)}</span> of <span className="font-medium">{result.meta.totalCount}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= result.meta.totalPages}
              className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}