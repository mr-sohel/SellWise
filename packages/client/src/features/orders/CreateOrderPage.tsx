import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateOrderDTO } from '@sellwise/shared';
import { createOrderSchema, SALES_CHANNEL_LABELS } from '@sellwise/shared';
import { useCreateOrder } from './hooks/useOrders';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Search, X } from 'lucide-react';
import { useProducts } from '../products/hooks/useProducts';
import api from '../../lib/api/client';
import type { Customer } from '@sellwise/shared';

interface ProductSearchResult {
  id: string;
  name: string;
  selling_price: number;
  stock_quantity: number;
  category: string | null;
}

export function CreateOrderPage() {
  const navigate = useNavigate();
  const { activeStoreId, store } = useAuthStore();
  const storeId = activeStoreId || '';
  const createMutation = useCreateOrder(storeId);
  const { data: productsResult } = useProducts(storeId, { page: 1, limit: 500 });

  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneResults, setPhoneResults] = useState<Customer[]>([]);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const phoneDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateOrderDTO>({
    resolver: zodResolver(createOrderSchema) as any,
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

  const subtotal = watchItems.reduce((acc, item) => {
    const product = productsResult?.data.find(p => p.id === item.product_id);
    return acc + (product ? product.selling_price * (item.quantity || 0) : 0);
  }, 0);

  const total = subtotal + Number(watchDelivery || 0) - Number(watchDiscount || 0);

  // Product search
  const filteredProducts = productsResult?.data.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()))
  ) || [];

  // Customer phone search
  const searchCustomers = useCallback(async (query: string) => {
    if (query.length < 3) {
      setPhoneResults([]);
      return;
    }
    try {
      const { data } = await api.get(`/stores/${storeId}/customers`, {
        params: { page: 1, limit: 5, search: query }
      });
      setPhoneResults(data.data || []);
    } catch {
      setPhoneResults([]);
    }
  }, [storeId]);

  const handlePhoneChange = (value: string) => {
    setPhoneSearch(value);
    setValue('customer.phone', value);
    setShowPhoneDropdown(true);
    if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);
    phoneDebounceRef.current = setTimeout(() => searchCustomers(value), 300);
  };

  const selectCustomer = (customer: Customer) => {
    setValue('customer.name', customer.name);
    setValue('customer.phone', customer.phone);
    setValue('customer.email', customer.email || '');
    setValue('customer.address', customer.address || '');
    setPhoneSearch(customer.phone);
    setShowPhoneDropdown(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setShowPhoneDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addProduct = (product: ProductSearchResult) => {
    // Find empty slot or append
    const emptyIndex = watchItems.findIndex(item => !item.product_id);
    if (emptyIndex >= 0) {
      setValue(`items.${emptyIndex}.product_id`, product.id);
    } else {
      append({ product_id: product.id, quantity: 1 });
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const removeProductItem = (index: number) => {
    remove(index);
  };

  const onSubmit = async (data: CreateOrderDTO) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/orders');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error?.message || 'Failed to create order');
    }
  };

  // Source options based on store's configured sales channels
  const sourceOptions = store?.sales_channels?.length
    ? store.sales_channels.map(ch => ({
        value: ch === 'walk_in' ? 'manual' : ch,
        label: SALES_CHANNEL_LABELS[ch as keyof typeof SALES_CHANNEL_LABELS]?.en || ch,
      }))
    : [
        { value: 'manual', label: 'Manual Entry' },
        { value: 'facebook', label: 'Facebook' },
      ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/orders" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display-md text-foreground">Create Order</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Customer Details + Items */}
          <div className="md:col-span-2 space-y-6">
            {/* Customer Details with Phone Lookup */}
            <div className="bg-card border border-border rounded-xl shadow-vercel-2 p-6">
              <h2 className="text-base font-medium mb-4">Customer Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                  <div className="relative" ref={phoneDropdownRef}>
                    <input
                      value={phoneSearch}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onFocus={() => phoneSearch.length >= 3 && setShowPhoneDropdown(true)}
                      className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                      placeholder="Search by phone..."
                    />
                    {showPhoneDropdown && phoneResults.length > 0 && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-vercel-5 py-1 max-h-48 overflow-auto">
                        {phoneResults.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectCustomer(c)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <span className="font-medium">{c.name}</span>
                            <span className="text-muted-foreground ml-2">{c.phone}</span>
                            {c.total_orders > 0 && (
                              <span className="text-xs text-muted-foreground ml-2">({c.total_orders} orders)</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="hidden" {...register('customer.phone')} />
                  {errors.customer && (errors.customer as any).phone && <p className="text-destructive text-sm mt-1.5">{(errors.customer as any).phone?.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                  <input {...register('customer.name')} className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground" placeholder="Customer name" />
                  {errors.customer && (errors.customer as any).name && <p className="text-destructive text-sm mt-1.5">{(errors.customer as any).name?.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
                  <input {...register('customer.address')} className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground" placeholder="Delivery address" />
                </div>
              </div>
            </div>

            {/* Line Items with Search */}
            <div className="bg-card border border-border rounded-xl shadow-vercel-2 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium">Order Items</h2>
              </div>

              {/* Product Search Bar */}
              <div className="relative mb-4" ref={productDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="flex h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                    placeholder="Search products by name, SKU, or category..."
                  />
                  {productSearch && (
                    <button type="button" onClick={() => { setProductSearch(''); setShowProductDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {showProductDropdown && productSearch && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-vercel-5 py-1 max-h-64 overflow-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">No products found</div>
                    ) : (
                      filteredProducts.slice(0, 20).map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProduct(p)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium">{p.name}</span>
                            {p.category && <span className="text-muted-foreground ml-2 text-xs">{p.category}</span>}
                          </div>
                          <div className="text-right">
                            <span className="font-medium">৳{p.selling_price}</span>
                            <span className={`ml-2 text-xs ${p.stock_quantity > 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
                              ({p.stock_quantity} in stock)
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Items */}
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const product = watchItems[index]?.product_id
                    ? productsResult?.data.find(p => p.id === watchItems[index].product_id)
                    : null;
                  return (
                    <div key={field.id} className="flex gap-3 items-start">
                      <div className="flex-1">
                        {product ? (
                          <div className="flex h-10 items-center gap-2 px-3 bg-canvas-soft border border-border rounded-md text-sm">
                            <span className="font-medium truncate">{product.name}</span>
                            <span className="text-muted-foreground">৳{product.selling_price}</span>
                            <input type="hidden" {...register(`items.${index}.product_id`)} />
                          </div>
                        ) : (
                          <>
                            <select {...register(`items.${index}.product_id`)} className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground appearance-none">
                              <option value="">Select a product...</option>
                              {productsResult?.data.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (৳{p.selling_price})</option>
                              ))}
                            </select>
                          </>
                        )}
                        {errors.items?.[index]?.product_id && <p className="text-destructive text-sm mt-1.5">Product is required</p>}
                      </div>
                      <div className="w-24">
                        <input type="number" min="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground" />
                      </div>
                      <button type="button" onClick={() => removeProductItem(index)} className="p-2 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/5 transition-colors mt-0.5">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={() => append({ product_id: '', quantity: 1 })} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-80">
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <div className="bg-foreground text-primary-foreground border border-border rounded-xl shadow-vercel-3 p-6">
              <h2 className="text-base font-medium mb-4">Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-foreground/70">Subtotal</span>
                  <span className="font-medium">৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/70">Delivery</span>
                  <input type="number" {...register('delivery_charge', { valueAsNumber: true })} className="w-20 px-2 py-1 text-right border border-primary-foreground/20 rounded-md bg-foreground text-sm text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-foreground/30" />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/70">Discount</span>
                  <input type="number" {...register('discount', { valueAsNumber: true })} className="w-20 px-2 py-1 text-right border border-primary-foreground/20 rounded-md bg-foreground text-sm text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-foreground/30" />
                </div>

                <hr className="my-2 border-canvas/20" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Source</label>
                  <select {...register('source')} className="flex h-10 w-full rounded-md border border-primary-foreground/20 bg-foreground px-3 py-2 text-sm text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-foreground/30 appearance-none">
                    {sourceOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 inline-flex items-center justify-center h-10 bg-card text-foreground rounded-full font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
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
