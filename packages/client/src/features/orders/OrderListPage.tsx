import { useState } from 'react';
import { useOrders } from './hooks/useOrders';
import { useAuthStore } from '../../stores/auth.store';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '../../components/ui/page-header';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/dropdown-menu';

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
    <div className="w-full space-y-6 max-w-[1600px] mx-auto pb-8">
      <PageHeader
        title="Orders"
        action={
          <Link
            to="/orders/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create Order
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-full shadow-vercel-1 w-full sm:max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
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
          className="flex h-10 w-full sm:w-auto rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-vercel-1 outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none min-w-[160px]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
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
            <h3 className="text-base font-medium text-foreground">No orders found</h3>
            <p className="text-sm text-muted-foreground mt-1">Adjust your filters or create a new order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-base min-w-[700px]">
              <thead className="bg-canvas-soft/50 border-b border-border">
                <tr>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Order #</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Customer</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Date</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">Total</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-center whitespace-nowrap">Status</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((order: any) => (
                  <tr key={order.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="px-6 sm:px-8 py-5 font-medium text-foreground font-mono text-xs whitespace-nowrap">{order.order_number}</td>
                    <td className="px-6 sm:px-8 py-5 text-foreground">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 sm:px-8 py-5 text-muted-foreground whitespace-nowrap">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="px-6 sm:px-8 py-5 text-right text-foreground font-medium whitespace-nowrap">৳{order.total.toLocaleString()}</td>
                    <td className="px-6 sm:px-8 py-5 text-center">
                      <Badge variant={statusVariant[order.status] || 'muted'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 sm:px-8 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors focus-visible:outline-none">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link to={`/orders/${order.id}`} className="cursor-pointer w-full">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
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
