import { productRepository } from '../repositories/product.repository';
import { db } from '../config/db';
import { CreateProductDTO, UpdateProductDTO, ProductFiltersDTO, PaginatedResult, Product } from '@sellwise/shared';
import { NotFoundError, ConflictError } from '../errors/AppError';

export class ProductService {
  async getProducts(storeId: string, filters: ProductFiltersDTO): Promise<PaginatedResult<Product>> {
    return productRepository.findByStore(storeId, filters);
  }

  async getProduct(id: string, storeId: string): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product || product.store_id !== storeId || !product.is_active) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async createProduct(storeId: string, data: CreateProductDTO): Promise<Product> {
    return productRepository.create(storeId, data);
  }

  async updateProduct(id: string, storeId: string, data: UpdateProductDTO): Promise<Product> {
    const product = await productRepository.update(id, storeId, data);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async deleteProduct(id: string, storeId: string): Promise<void> {
    const deleted = await productRepository.softDelete(id, storeId);
    if (!deleted) {
      throw new NotFoundError('Product');
    }
  }

  async updateStock(id: string, storeId: string, quantityChange: number): Promise<Product> {
    if (!Number.isFinite(quantityChange)) {
      throw new ConflictError('quantityChange must be a valid number');
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const lockedProduct = await productRepository.findByIdForUpdate(id, storeId, client);
      if (!lockedProduct || !lockedProduct.is_active) {
        throw new NotFoundError('Product');
      }

      const newStock = lockedProduct.stock_quantity + quantityChange;
      if (newStock < 0) {
        throw new ConflictError(
          `Insufficient stock. Available: ${lockedProduct.stock_quantity}, Requested change: ${quantityChange}`,
          { available: lockedProduct.stock_quantity, requested: quantityChange }
        );
      }

      const updated = await productRepository.update(id, storeId, { stock_quantity: newStock }, client);
      if (!updated) {
        throw new NotFoundError('Product');
      }
      await client.query('COMMIT');
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async bulkImport(storeId: string, products: CreateProductDTO[]): Promise<Product[]> {
    return productRepository.bulkInsert(storeId, products);
  }
}

export const productService = new ProductService();