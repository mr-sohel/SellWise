import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { updateProductSchema, type UpdateProductDTO } from '@sellwise/shared';
import { useProduct, useUpdateProduct } from './hooks/useProducts';
import { useAuthStore } from '../../stores/auth.store';
import { ArrowLeft, Save } from 'lucide-react';
import { ProductForecastChart } from './components/ProductForecastChart';

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
    formState: { errors },
  } = useForm<UpdateProductDTO>({
    resolver: zodResolver(updateProductSchema),
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
        navigate('/products');
      },
      onError: (error) => {
        console.error('Failed to update product:', error);
        alert('Failed to update product. Please check your input and try again.');
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading product data...</div>;
  }

  if (isError || !product) {
    return <div className="p-8 text-center text-destructive">Failed to load product.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/products"
          className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-foreground">
          {t('common.products')} - Edit
        </h1>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className={`w-full px-3 py-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.name ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="e.g. Wireless Mouse"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Product Name (Bangla)
                  </label>
                  <input
                    {...register('name_bn')}
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g. ওয়্যারলেস মাউস"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    SKU
                  </label>
                  <input
                    {...register('sku')}
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g. WM-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Category
                  </label>
                  <input
                    {...register('category')}
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g. Electronics"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2 mt-2">
                Pricing & Inventory
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Selling Price (৳) <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('selling_price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.selling_price ? 'border-destructive' : 'border-border'
                    }`}
                  />
                  {errors.selling_price && (
                    <p className="mt-1 text-sm text-destructive">{errors.selling_price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Cost Price (৳)
                  </label>
                  <input
                    {...register('cost_price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Stock Quantity <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('stock_quantity', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.stock_quantity ? 'border-destructive' : 'border-border'
                    }`}
                  />
                  {errors.stock_quantity && (
                    <p className="mt-1 text-sm text-destructive">{errors.stock_quantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    {...register('low_stock_threshold', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Unit
                  </label>
                  <input
                    {...register('unit')}
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g. pcs, kg, box"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
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
