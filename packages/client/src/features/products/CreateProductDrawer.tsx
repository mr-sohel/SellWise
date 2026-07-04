import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, type CreateProductDTO } from '@sellwise/shared';
import { useCreateProduct } from './hooks/useProducts';
import { useAuthStore } from '../../stores/auth.store';
import { CategoryPicker } from '../categories/CategoryPicker';
import { Save } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../../components/ui/drawer';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface CreateProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDrawer({ open, onOpenChange }: CreateProductDrawerProps) {
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const { mutate: createProduct, isPending } = useCreateProduct(storeId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateProductDTO>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      name: '',
      name_bn: '',
      sku: '',
      category: '',
      cost_price: 0,
      selling_price: 0,
      stock_quantity: 0,
      low_stock_threshold: 10,
      unit: 'pcs',
    },
  });

  // Reset form when drawer opens
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const watchCategory = watch('category');

  const onSubmit = (data: CreateProductDTO) => {
    createProduct(data, {
      onSuccess: () => {
        toast.success('Product created successfully');
        onOpenChange(false);
      },
      onError: (error) => {
        console.error('Failed to create product:', error);
        toast.error('Failed to create product. Please check your input.');
      }
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="sm:max-w-xl">
        <DrawerHeader>
          <DrawerTitle>Add New Product</DrawerTitle>
          <DrawerDescription>Create a new product to add to your inventory.</DrawerDescription>
        </DrawerHeader>
        <div className="p-6 overflow-y-auto">
          <form id="create-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className={`flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
                      errors.name ? 'border-destructive' : 'border-input'
                    }`}
                    placeholder="e.g. Wireless Mouse"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Name (Bangla)
                  </label>
                  <input
                    {...register('name_bn')}
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    placeholder="e.g. ওয়্যারলেস মাউস"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">SKU</label>
                  <input
                    {...register('sku')}
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    placeholder="e.g. WM-001"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                  <CategoryPicker
                    storeId={storeId}
                    value={watchCategory || ''}
                    onChange={(val) => setValue('category', val)}
                    error={errors.category?.message}
                  />
                  {errors.category && (
                    <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                Pricing & Inventory
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Selling Price (৳) <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('selling_price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
                      errors.selling_price ? 'border-destructive' : 'border-input'
                    }`}
                  />
                  {errors.selling_price && (
                    <p className="mt-1 text-xs text-destructive">{errors.selling_price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Cost Price (৳)</label>
                  <input
                    {...register('cost_price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Initial Stock <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('stock_quantity', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className={`flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
                      errors.stock_quantity ? 'border-destructive' : 'border-input'
                    }`}
                  />
                  {errors.stock_quantity && (
                    <p className="mt-1 text-xs text-destructive">{errors.stock_quantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
                  <input
                    {...register('unit')}
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    placeholder="e.g. pcs, kg, box"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter className="border-t border-border mt-auto">
          <button
            type="submit"
            form="create-product-form"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Saving...' : 'Save Product'}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
