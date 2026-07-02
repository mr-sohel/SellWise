import { productRepository } from '../repositories/product.repository';
import { CreateProductDTO, UpdateProductDTO, ProductFiltersDTO, PaginatedResult, Product } from '@sellwise/shared';
import { NotFoundError } from '../errors/AppError';

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
    const product = await this.getProduct(id, storeId);

    const newStock = product.stock_quantity + quantityChange;
    if (newStock < 0) {
      throw new Error('Stock cannot be negative'); // Or a ConflictError
    }

    const updated = await productRepository.update(id, storeId, { stock_quantity: newStock });
    if (!updated) {
      throw new NotFoundError('Product');
    }
    return updated;
  }

  async bulkImport(storeId: string, products: CreateProductDTO[]): Promise<Product[]> {
    return productRepository.bulkInsert(storeId, products);
  }
}

export const productService = new ProductService();