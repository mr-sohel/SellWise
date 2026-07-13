import { db } from '../config/db';
import { orderRepository } from '../repositories/order.repository';
import { customerRepository } from '../repositories/customer.repository';
import { productRepository } from '../repositories/product.repository';
import { CreateOrderDTO, Order, OrderItem, OrderFiltersDTO, PaginatedResult, UpdateOrderStatusDTO, ORDER_STATUS_TRANSITIONS, type OrderStatus } from '@sellwise/shared';
import { ConflictError, NotFoundError } from '../errors/AppError';
import { generateOrderNumber } from '../utils/orderNumber';

export class OrderService {
  async listOrders(storeId: string, filters: OrderFiltersDTO): Promise<PaginatedResult<Order>> {
    return orderRepository.findByStore(storeId, filters);
  }

  async getOrder(storeId: string, id: string): Promise<any> {
    const order = await orderRepository.findById(id);
    if (!order || order.store_id !== storeId) {
      throw new NotFoundError('Order');
    }
    const items = await orderRepository.findItemsByOrderId(id);
    const customer = await customerRepository.findById(order.customer_id);
    
    return { 
      ...order, 
      customer_name: customer?.name || null,
      customer_phone: customer?.phone || null,
      customer_address: customer?.address || null,
      items 
    };
  }

  async createOrder(storeId: string, data: CreateOrderDTO): Promise<Order> {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // 1. Resolve Customer — link existing by ID or upsert by phone
      let customer;
      if ('customer_id' in data.customer) {
        const customerId = data.customer.customer_id as string;
        const found = await customerRepository.findById(customerId);
        if (!found || found.store_id !== storeId) throw new NotFoundError('Customer');
        customer = found;
      } else {
        customer = await customerRepository.upsertByPhone(storeId, data.customer, client);
      }

      // 2. Sort items by product_id to prevent deadlocks when locking rows
      const sortedItems = [...data.items].sort((a, b) => a.product_id.localeCompare(b.product_id));

      // Calculate totals and validate stock
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of sortedItems) {
        // SELECT ... FOR UPDATE locks the row
        const product = await productRepository.findByIdForUpdate(item.product_id, storeId, client);

        if (!product) {
          throw new NotFoundError(`Product ${item.product_id}`);
        }

        if (product.stock_quantity < item.quantity) {
          throw new ConflictError(
            `Insufficient stock for '${product.name}'. Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
            { product_id: product.id, available: product.stock_quantity, requested: item.quantity }
          );
        }

        const itemTotal = product.selling_price * item.quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.selling_price,
          costPrice: product.cost_price,
          quantity: item.quantity
        });

        // Deduct stock
        await productRepository.decrementStock(product.id, storeId, item.quantity, client);
      }

      const total = subtotal + data.delivery_charge - data.discount;

      // 3. Create Order Header
      const orderNumber = generateOrderNumber();
      const order = await orderRepository.createHeader(storeId, customer.id, orderNumber, data, total, client);

      // 4. Create Order Items (Snapshot)
      for (const item of orderItemsData) {
        await orderRepository.createItem(
          order.id,
          item.productId,
          item.productName,
          item.unitPrice,
          item.costPrice,
          item.quantity,
          client
        );
      }

      // 5. Update Customer Stats
      await customerRepository.incrementOrderStats(customer.id, storeId, total, client);

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(id: string, storeId: string, data: UpdateOrderStatusDTO): Promise<Order> {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const order = await orderRepository.findById(id, client);
      if (!order || order.store_id !== storeId) {
        throw new NotFoundError('Order');
      }

      // Validate status transition using the state machine
      const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status as OrderStatus];
      if (!allowedTransitions || !allowedTransitions.includes(data.status as OrderStatus)) {
        throw new ConflictError(`Cannot transition from '${order.status}' to '${data.status}'`);
      }

      const updatedOrder = await orderRepository.updateStatus(id, storeId, data.status, client);

      // Stock Restoration if cancelled or returned
      if (data.status === 'cancelled' || data.status === 'returned') {
        const items = await orderRepository.findItemsByOrderId(id, client);
        for (const item of items) {
          // decrementStock with negative quantity = increment
          await productRepository.decrementStock(item.product_id, storeId, -item.quantity, client);
        }
      }

      await client.query('COMMIT');
      return updatedOrder!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const orderService = new OrderService();