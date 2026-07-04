import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts, useDeleteProduct } from './hooks/useProducts';
import { useAuthStore } from '../../stores/auth.store';
import { Link } from 'react-router-dom';
import { Plus, Search, FileUp, Trash2, Edit } from 'lucide-react';
import { PageHeader } from '../../components/ui/page-header';
import { Badge } from '../../components/ui/badge';

export function ProductListPage() {
  const { t } = useTranslation();
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: result, isLoading } = useProducts(storeId, { page, limit: 10, search });
  const deleteMutation = useDeleteProduct(storeId);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t('common.products')}
        action={
          <div className="flex gap-2">
            <Link
              to="/products/import"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors"
            >
              <FileUp className="h-4 w-4" />
              Bulk Import
            </Link>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </div>
        }
      />

      <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-full shadow-vercel-1 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-vercel-2 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading products...</div>
        ) : result?.data.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-base font-medium text-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">Get started by creating a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-soft/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Price</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Stock</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((product) => (
                  <tr key={product.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">{product.name}</td>
                    <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{product.sku || '-'}</td>
                    <td className="px-6 py-3 text-right text-foreground">৳{product.selling_price.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">
                      <Badge variant={product.stock_quantity <= product.low_stock_threshold ? 'destructive' : 'success'}>
                        {product.stock_quantity} {product.unit}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/5 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
            Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, result.meta.totalCount)}</span> of <span className="font-medium text-foreground">{result.meta.totalCount}</span> results
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
