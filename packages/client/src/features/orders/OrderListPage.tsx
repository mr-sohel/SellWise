import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders } from './hooks/useOrders';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';

export function OrderListPage() {
  const { t } = useTranslation();
  const storeId = "00000000-0000-0000-0000-000000000000"; // Placeholder

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data: result, isLoading } = useOrders(storeId, { page, limit: 10, search, status });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          {t('common.orders')}
        </h1>
        <Link to="/orders/new" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-sm text-sm font-medium transition-opacity">
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center px-3 py-2 bg-card border border-border rounded-md shadow-sm w-full max-w-sm">
          <Search className="h-5 w-5 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            className="bg-transparent border-none outline-none w-full focus:ring-0 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-md shadow-sm text-sm outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
        ) : result?.data.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-foreground">No orders found</h3>
            <p className="text-muted-foreground mt-1">Adjust your filters or create a new order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Order #</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{order.order_number}</td>
                    <td className="px-6 py-4 text-foreground">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right text-foreground font-medium">৳{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link to={`/orders/${order.id}`} className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
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

      {/* Pagination component logic omitted for brevity, would be similar to ProductListPage */}
    </div>
  );
}