import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts, useDeleteProduct } from './hooks/useProducts';
import { useAuthStore } from '../../stores/auth.store';
import { Link } from 'react-router-dom';
import { Plus, Search, FileUp, Trash2, Edit } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          {t('common.products')}
        </h1>
        <div className="flex gap-2">
          <Link to="/products/import" className="inline-flex items-center px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-md shadow-sm text-sm font-medium transition-colors">
            <FileUp className="mr-2 h-4 w-4" />
            Bulk Import
          </Link>
          <Link to="/products/new" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-sm text-sm font-medium transition-opacity">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="flex items-center px-3 py-2 bg-card border border-border rounded-md shadow-sm max-w-md">
        <Search className="h-5 w-5 text-muted-foreground mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="bg-transparent border-none outline-none w-full focus:ring-0 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card border border-border rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading products...</div>
        ) : result?.data.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-foreground">No products found</h3>
            <p className="text-muted-foreground mt-1">Get started by creating a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium text-right">Price</th>
                  <th className="px-6 py-4 font-medium text-right">Stock</th>
                  <th className="px-6 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{product.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{product.sku || '-'}</td>
                    <td className="px-6 py-4 text-right text-foreground">৳{product.selling_price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock_quantity <= product.low_stock_threshold
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {product.stock_quantity} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
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
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, result.meta.totalCount)}</span> of <span className="font-medium">{result.meta.totalCount}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= result.meta.totalPages}
              className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}