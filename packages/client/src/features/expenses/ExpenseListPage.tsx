import { useState } from 'react';
import { useExpenses, useDeleteExpense, useCreateExpense } from './hooks/useExpenses';
import { useAuthStore } from '../../stores/auth.store';
import { Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateExpenseDTO } from '@sellwise/shared';
import { createExpenseSchema } from '@sellwise/shared';
import { PageHeader } from '../../components/ui/page-header';

export function ExpenseListPage() {
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const [page, setPage] = useState(1);
  const { data: result, isLoading } = useExpenses(storeId, { page, limit: 10 });
  const deleteMutation = useDeleteExpense(storeId);
  const createMutation = useCreateExpense(storeId);

  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateExpenseDTO>({
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      category: '',
      amount: 0,
      notes: ''
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = async (data: CreateExpenseDTO) => {
    try {
      await createMutation.mutateAsync(data);
      setShowForm(false);
      reset();
    } catch (error) {
      console.error('Failed to create expense', error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Expenses"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Add Expense'}
          </button>
        }
      />

      {showForm && (
        <div className="bg-card border border-border rounded-xl shadow-vercel-3 p-6 max-w-2xl">
          <h2 className="text-base font-medium mb-4">Record New Expense</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Notes</label>
                <input {...register('notes')} className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-vercel-2 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading expenses...</div>
        ) : result?.data.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-base font-medium text-foreground">No expenses recorded</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-soft/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((expense) => (
                  <tr key={expense.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="px-6 py-3 text-muted-foreground">{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td className="px-6 py-3 font-medium text-foreground">{expense.category}</td>
                    <td className="px-6 py-3 text-muted-foreground">{expense.notes || '-'}</td>
                    <td className="px-6 py-3 text-right text-foreground font-medium">৳{expense.amount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/5 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
            Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, result.meta.totalCount)}</span>
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
