import { categoryRepository } from '../repositories/category.repository';
import type { Category, CreateCategoryDTO } from '@sellwise/shared';
import { NotFoundError } from '../errors/AppError';

export class CategoryService {
  async listByStore(storeId: string): Promise<Category[]> {
    return categoryRepository.findByStore(storeId);
  }

  async createCategory(storeId: string, data: CreateCategoryDTO): Promise<Category> {
    return categoryRepository.createCategory(storeId, data);
  }

  async updateCategory(categoryId: string, storeId: string, data: { name?: string; name_bn?: string }): Promise<Category> {
    const updated = await categoryRepository.updateCategory(categoryId, storeId, data);
    if (!updated) {
      throw new NotFoundError('Category not found');
    }
    return updated;
  }

  async deleteCategory(categoryId: string, storeId: string): Promise<void> {
    const deleted = await categoryRepository.deleteCategory(categoryId, storeId);
    if (!deleted) {
      throw new NotFoundError('Category not found or is a default category');
    }
  }
}

export const categoryService = new CategoryService();
