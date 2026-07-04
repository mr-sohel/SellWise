import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { updateProductSchema, type UpdateProductDTO } from '@sellwise/shared';
import { useProduct, useUpdateProduct } from './hooks/useProducts';
import { useAuthStore } from '../../stores/auth.store';
import { CategoryPicker } from '../categories/CategoryPicker';
import { ArrowLeft, Save } from 'lucide-react';
import { ProductForecastChart } from './components/ProductForecastChart';
import { toast } from 'sonner';
import { Skeleton } from '../../components/ui/skeleton';

export function EditProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const { data: product, isLoading, isError } = useProduct(storeId, id || '');
  const { mutate: updateProduct, isPending } = useUpdateProduct(storeId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateProductDTO>({
    resolver: zodResolver(updateProductSchema) as any,
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

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        name_bn: product.name_bn,
        sku: product.sku,
        category: product.category,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
        unit: product.unit,
      });
    }
  }, [product, reset]);

  const onSubmit = (data: UpdateProductDTO) => {
    if (!id) return;

    updateProduct({ id, data }, {
      onSuccess: () => {
        toast.success('Product updated successfully');
        navigate('/products');
      },
      onError: (error) => {
        console.error('Failed to update product:', error);
        toast.error('Failed to update product. Please check your input.');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !product) {
    return <div className="p-8 text-center text-destructive">Failed to load product.</div>;
  }

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
          {t('common.products')} — Edit
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
                <label className="block text-sm font-medium text-foreground mb-1.5">Product Name (Bangla)</label>
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
                  Stock Quantity <span className="text-destructive">*</span>
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
              {isPending ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-3xl">
        <ProductForecastChart storeId={storeId} productId={id || ''} />
      </div>
    </div>
  );
}
