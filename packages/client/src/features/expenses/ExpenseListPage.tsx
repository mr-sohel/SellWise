import React, { useState } from 'react';
import { useExpenses, useDeleteExpense, useCreateExpense } from './hooks/useExpenses';
import { Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateExpenseDTO } from '@sellwise/shared';
import { createExpenseSchema } from '@sellwise/shared';

export function ExpenseListPage() {
  const storeId = "00000000-0000-0000-0000-000000000000"; // Placeholder

  const [page, setPage] = useState(1);
  const { data: result, isLoading } = useExpenses(storeId, { page, limit: 10 });
  const deleteMutation = useDeleteExpense(storeId);
  const createMutation = useCreateExpense(storeId);

  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateExpenseDTO>({
    resolver: zodResolver(createExpenseSchema),
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
    await createMutation.mutateAsync(data);
    setShowForm(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-sm text-sm font-medium transition-opacity"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg shadow p-6 max-w-2xl">
          <h2 className="text-lg font-medium mb-4">Record New Expense</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input {...register('category')} className="w-full px-3 py-2 border border-input rounded-md bg-background" placeholder="e.g. Marketing, Packaging" />
                {errors.category && <p className="text-destructive text-sm mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
                {errors.amount && <p className="text-destructive text-sm mt-1">{errors.amount.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input {...register('notes')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading expenses...</div>
        ) : result?.data.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-foreground">No expenses recorded</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Notes</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{expense.category}</td>
                    <td className="px-6 py-4 text-muted-foreground">{expense.notes || '-'}</td>
                    <td className="px-6 py-4 text-right text-foreground font-medium">৳{expense.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
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
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, result.meta.totalCount)}</span>
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