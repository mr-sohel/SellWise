import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomers } from './hooks/useCustomers';
import { Search } from 'lucide-react';

export function CustomerListPage() {
  const { t } = useTranslation();
  const storeId = "00000000-0000-0000-0000-000000000000"; // Placeholder

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: result, isLoading } = useCustomers(storeId, { page, limit: 10, search });

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
                  <th className="px-6 py-4 font-medium text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{customer.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div>{customer.phone}</div>
                      {customer.email && <div className="text-xs">{customer.email}</div>}
                    </td>
                    <td className="px-6 py-4 text-foreground">{customer.total_orders}</td>
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