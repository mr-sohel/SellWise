import { useState } from 'react';
import { useExpenses, useDeleteExpense, useCreateExpense } from './hooks/useExpenses';
import { useAuthStore } from '../../stores/auth.store';
import { Trash2, Plus, MoreHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateExpenseDTO } from '@sellwise/shared';
import { createExpenseSchema } from '@sellwise/shared';
import { PageHeader } from '../../components/ui/page-header';
import { Skeleton } from '../../components/ui/skeleton';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerTrigger } from '../../components/ui/drawer';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

export function ExpenseListPage() {
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const [page, setPage] = useState(1);
  const { data: result, isLoading } = useExpenses(storeId, { page, limit: 10 });
  const deleteMutation = useDeleteExpense(storeId);
  const createMutation = useCreateExpense(storeId);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateExpenseDTO>({
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      category: '',
      amount: 0,
      notes: ''
    }
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Expense deleted successfully');
      } catch (e) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const onSubmit = async (data: CreateExpenseDTO) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Expense recorded successfully');
      setIsDrawerOpen(false);
      reset();
    } catch (error) {
      console.error('Failed to create expense', error);
      toast.error('Failed to record expense');
    }
  };

  return (
    <div className="w-full space-y-6 max-w-[1600px] mx-auto pb-8">
      <PageHeader
        title="Expenses"
        action={
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </button>
            </DrawerTrigger>
            <DrawerContent side="right">
              <DrawerHeader>
                <DrawerTitle>Record New Expense</DrawerTitle>
                <DrawerDescription>Log a new business expense here.</DrawerDescription>
              </DrawerHeader>
              <div className="p-6 overflow-y-auto">
                <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Category</label>
                      <input {...register('category')} className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground" placeholder="e.g. Marketing, Packaging" />
                      {errors.category && <p className="text-destructive text-sm mt-1.5">{errors.category.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Amount</label>
                      <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground" />
                      {errors.amount && <p className="text-destructive text-sm mt-1.5">{errors.amount.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Notes</label>
                      <textarea rows={4} {...register('notes')} className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground resize-none" placeholder="Optional details about this expense..." />
                    </div>
                  </div>
                </form>
              </div>
              <DrawerFooter className="border-t border-border p-6 mt-auto">
                <button
                  type="submit"
                  form="expense-form"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity w-full sm:w-auto"
                >
                  {isSubmitting ? 'Saving...' : 'Save Expense'}
                </button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        }
      />

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
            <h3 className="text-base font-medium text-foreground">No expenses recorded</h3>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-base min-w-[500px]">
              <thead className="bg-canvas-soft/50 border-b border-border">
                <tr>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Date</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Category</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Notes</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">Amount</th>
                  <th className="px-6 sm:px-8 py-5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((expense) => (
                  <tr key={expense.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="px-6 sm:px-8 py-5 text-muted-foreground whitespace-nowrap">{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td className="px-6 sm:px-8 py-5 font-medium text-foreground">{expense.category}</td>
                    <td className="px-6 sm:px-8 py-5 text-muted-foreground max-w-[200px] truncate">{expense.notes || '-'}</td>
                    <td className="px-6 sm:px-8 py-5 text-right text-foreground font-medium whitespace-nowrap">৳{expense.amount.toLocaleString()}</td>
                    <td className="px-6 sm:px-8 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors focus-visible:outline-none">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => handleDelete(expense.id)}
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
            Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, result.meta.totalCount)}</span>
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
