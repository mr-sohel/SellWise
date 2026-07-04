import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts, useDeleteProduct } from './hooks/useProducts';
import { useAuthStore } from '../../stores/auth.store';
import { Link } from 'react-router-dom';
import { Plus, Search, FileUp, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '../../components/ui/page-header';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { CreateProductDrawer } from './CreateProductDrawer';

export function ProductListPage() {
  const { t } = useTranslation();
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const { data: result, isLoading } = useProducts(storeId, { page, limit: 10, search });
  const deleteMutation = useDeleteProduct(storeId);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <CreateProductDrawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen} />

      <PageHeader
        title={t('common.products')}
        action={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link
              to="/products/import"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border bg-card text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors w-full sm:w-auto cursor-pointer"
            >
              <FileUp className="h-4 w-4" />
              Bulk Import
            </Link>
            <button
              onClick={() => setIsCreateDrawerOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-full shadow-vercel-1 w-full sm:max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-vercel-2 overflow-hidden w-full">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : result?.data.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-base font-medium text-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">Get started by creating a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-canvas-soft/50 border-b border-border">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Name</th>
                  <th className="px-4 sm:px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">SKU</th>
                  <th className="px-4 sm:px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">Price</th>
                  <th className="px-4 sm:px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">Stock</th>
                  <th className="px-4 sm:px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((product) => (
                  <tr key={product.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 font-medium text-foreground">{product.name}</td>
                    <td className="px-4 sm:px-6 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">{product.sku || '-'}</td>
                    <td className="px-4 sm:px-6 py-3 text-right text-foreground whitespace-nowrap">৳{product.selling_price.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">
                      <Badge variant={product.stock_quantity <= product.low_stock_threshold ? 'destructive' : 'success'}>
                        {product.stock_quantity} {product.unit}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors focus-visible:outline-none">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link to={`/products/${product.id}/edit`} className="cursor-pointer w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {result?.meta && result.meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, result.meta.totalCount)}</span> of <span className="font-medium text-foreground">{result.meta.totalCount}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium border border-border rounded-full hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= result.meta.totalPages}
              className="px-3 py-1.5 text-sm font-medium border border-border rounded-full hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
