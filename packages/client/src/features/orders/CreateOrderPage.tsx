import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateOrderDTO } from '@sellwise/shared';
import { createOrderSchema } from '@sellwise/shared';
import { useCreateOrder } from './hooks/useOrders';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { useProducts } from '../products/hooks/useProducts';

export function CreateOrderPage() {
  const navigate = useNavigate();
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';
  const createMutation = useCreateOrder(storeId);
  const { data: productsResult } = useProducts(storeId, { page: 1, limit: 100 });

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CreateOrderDTO>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customer: { name: '', phone: '', email: '', address: '' },
      items: [{ product_id: '', quantity: 1 }],
      delivery_charge: 60,
      discount: 0,
      source: 'manual'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchDelivery = watch('delivery_charge');
  const watchDiscount = watch('discount');

  // Calculate Subtotal dynamically
  const subtotal = watchItems.reduce((acc, item) => {
    const product = productsResult?.data.find(p => p.id === item.product_id);
    return acc + (product ? product.selling_price * (item.quantity || 0) : 0);
  }, 0);

  const total = subtotal + Number(watchDelivery || 0) - Number(watchDiscount || 0);

  const onSubmit = async (data: CreateOrderDTO) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/orders');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error?.message || 'Failed to create order');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/orders" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Create Order</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Customer Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input {...register('customer.name')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
                  {errors.customer?.name && <p className="text-destructive text-sm mt-1">{errors.customer.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input {...register('customer.phone')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
                  {errors.customer?.phone && <p className="text-destructive text-sm mt-1">{errors.customer.phone.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input {...register('customer.address')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-card border border-border rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order Items</h2>
              </div>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <select {...register(`items.${index}.product_id`)} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                        <option value="">Select a product...</option>
                        {productsResult?.data.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (৳{p.selling_price})</option>
                        ))}
                      </select>
                      {errors.items?.[index]?.product_id && <p className="text-destructive text-sm mt-1">Product is required</p>}
                    </div>
                    <div className="w-24">
                      <input type="number" min="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-full px-3 py-2 border border-input rounded-md bg-background text-center" />
                    </div>
                    <button type="button" onClick={() => remove(index)} className="p-2 text-muted-foreground hover:text-destructive mt-1">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => append({ product_id: '', quantity: 1 })} className="mt-4 flex items-center text-sm font-medium text-primary hover:opacity-80">
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Delivery</span>
                  <input type="number" {...register('delivery_charge', { valueAsNumber: true })} className="w-20 px-2 py-1 text-right border border-input rounded-md bg-background" />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Discount</span>
                  <input type="number" {...register('discount', { valueAsNumber: true })} className="w-20 px-2 py-1 text-right border border-input rounded-md bg-background" />
                </div>

                <hr className="my-2 border-border" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">৳{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Source</label>
                  <select {...register('source')} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                    <option value="manual">Manual Entry</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}