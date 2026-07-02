import { z } from 'zod';

export const createExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  expense_date: z.coerce.date().default(() => new Date()),
  notes: z.string().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export type CreateExpenseDTO = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDTO = z.infer<typeof updateExpenseSchema>;
export type ExpenseFiltersDTO = z.infer<typeof expenseFiltersSchema>;