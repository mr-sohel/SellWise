import { useState } from 'react';
import { useOrders } from './hooks/useOrders';
import { useAuthStore } from '../../stores/auth.store';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';
import { PageHeader } from '../../components/ui/page-header';
import { Badge } from '../../components/ui/badge';

const statusVariant: Record<string, 'success' | 'destructive' | 'warning' | 'info' | 'muted'> = {
  delivered: 'success',
  cancelled: 'destructive',
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
};

export function OrderListPage() {
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data: result, isLoading } = useOrders(storeId, { page, limit: 10, search, status });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Orders"
        action={
          <Link
            to="/orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Create Order
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-full shadow-vercel-1 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex h-10 w-full sm:w-auto rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground appearance-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-vercel-2 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading orders...</div>
        ) : result?.data.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-base font-medium text-foreground">No orders found</h3>
            <p className="text-sm text-muted-foreground mt-1">Adjust your filters or create a new order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-soft/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Order #</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Total</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">Status</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((order: any) => (
                  <tr key={order.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground font-mono text-xs">{order.order_number}</td>
                    <td className="px-6 py-3 text-foreground">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right text-foreground font-medium">৳{order.total.toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <Badge variant={statusVariant[order.status] || 'muted'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
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
            Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, result.meta.totalCount)}</span>
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
