import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createProductSchema, type CreateProductDTO } from '@sellwise/shared';
import { useCreateProduct } from './hooks/useProducts';
import { useAuthStore } from '../../stores/auth.store';
import { CategoryPicker } from '../categories/CategoryPicker';
import { ArrowLeft, Save } from 'lucide-react';

export function CreateProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const { mutate: createProduct, isPending } = useCreateProduct(storeId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const watchCategory = watch('category');

  const onSubmit = (data: CreateProductDTO) => {
    createProduct(data, {
      onSuccess: () => {
        navigate('/products');
      },
      onError: (error) => {
        console.error('Failed to create product:', error);
        alert('Failed to create product. Please check your input and try again.');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          to="/products"
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display-md text-foreground">
          {t('common.products')} — Add New
        </h1>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-vercel-3 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-foreground border-b border-border pb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Product Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className={`flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground ${
                    errors.name ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="e.g. Wireless Mouse"
                />
                {errors.name && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Product Name (Bangla)
                </label>
                <input
                  {...register('name_bn')}
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                  placeholder="e.g. ওয়্যারলেস মাউস"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">SKU</label>
                <input
                  {...register('sku')}
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                  placeholder="e.g. WM-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                <CategoryPicker
                  storeId={storeId}
                  value={watchCategory || ''}
                  onChange={(val) => setValue('category', val)}
                  error={errors.category?.message}
                />
                {errors.category && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-foreground border-b border-border pb-3">
              Pricing & Inventory
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Selling Price (৳) <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('selling_price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className={`flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground ${
                    errors.selling_price ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.selling_price && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.selling_price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Cost Price (৳)</label>
                <input
                  {...register('cost_price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
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
                  className={`flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground ${
                    errors.stock_quantity ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.stock_quantity && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.stock_quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Low Stock Threshold</label>
                <input
                  {...register('low_stock_threshold', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
                <input
                  {...register('unit')}
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                  placeholder="e.g. pcs, kg, box"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-4 py-2 border border-border bg-card text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
