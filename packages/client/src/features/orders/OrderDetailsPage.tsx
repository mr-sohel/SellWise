import { useParams, Link } from 'react-router-dom';
import { useOrder } from './hooks/useOrders';
import { useAuthStore } from '../../stores/auth.store';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { ArrowLeft, Package, User, MapPin } from 'lucide-react';

const statusVariant: Record<string, 'success' | 'destructive' | 'warning' | 'info' | 'muted'> = {
  delivered: 'success',
  cancelled: 'destructive',
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
};

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const { data: order, isLoading } = useOrder(storeId, id || '');

  if (isLoading) {
    return (
      <div className="w-full space-y-6 max-w-5xl mx-auto pb-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-16 text-center">
        <h3 className="text-base font-medium text-foreground">Order not found</h3>
        <Link to="/orders" className="text-primary mt-2 inline-block">Return to orders</Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto pb-8">
      <Link to="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Order #{order.order_number}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Placed on {new Date(order.order_date).toLocaleString()}
          </p>
        </div>
        <Badge variant={statusVariant[order.status] || 'muted'} className="text-sm px-3 py-1">
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Order Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-canvas-soft/30 font-medium flex items-center">
              <Package className="h-5 w-5 mr-2 text-muted-foreground" />
              Items
            </div>
            <div className="divide-y divide-border">
              {order.items?.map((item: any) => (
                <div key={item.id} className="p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{item.product_name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      ৳{Number(item.unit_price).toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-semibold text-right">
                    ৳{(Number(item.unit_price) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-canvas-soft/30 p-6 space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>৳{(Number(order.total) - Number(order.delivery_charge) + Number(order.discount)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery Charge</span>
                <span>+৳{Number(order.delivery_charge).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Discount</span>
                <span className="text-destructive">-৳{Number(order.discount).toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <h3 className="font-medium flex items-center mb-4">
              <User className="h-5 w-5 mr-2 text-muted-foreground" />
              Customer Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-0.5">Name</p>
                <p className="font-medium">{order.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Phone</p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
              {order.customer_address && (
                <div>
                  <p className="text-muted-foreground mb-0.5">Address</p>
                  <p className="font-medium">{order.customer_address}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <h3 className="font-medium flex items-center mb-4">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
              Order Info
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-0.5">Source</p>
                <p className="font-medium capitalize">{order.source.replace('_', ' ')}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-muted-foreground mb-0.5">Notes</p>
                  <p className="font-medium">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
