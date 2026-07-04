import { db } from '../config/db';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { PoolClient } from 'pg';
import crypto from 'crypto';

const TARGET_EMAIL = 'test@gmail.com';
const TARGET_PASSWORD = 'Sohelr';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Beauty', 'Sports'];
const UNITS = ['pcs', 'kg', 'box', 'dozen'];

// Helper for random numbers
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomEl = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  console.log('Starting seed process...');
  let client: PoolClient | null = null;

  try {
    // 1. Get or Create User
    let user = await userRepository.findByEmail(TARGET_EMAIL);
    let storeId: string;

    if (!user) {
      console.log(`User ${TARGET_EMAIL} not found. Creating...`);
      const result = await authService.signup({
        email: TARGET_EMAIL,
        password: TARGET_PASSWORD,
        preferred_lang: 'en'
      });
      user = result.user as any;
      storeId = result.storeId;
      console.log(`Created user with ID: ${user!.id} and Store ID: ${storeId}`);
    } else {
      console.log(`User ${TARGET_EMAIL} found. Logging in to get store...`);
      const result = await authService.login({
        email: TARGET_EMAIL,
        password: TARGET_PASSWORD
      });
      if (!result.storeId) {
        throw new Error('User has no store!');
      }
      storeId = result.storeId;
      console.log(`Logged in. Store ID: ${storeId}`);
    }

    client = await db.connect();

    // 2. Generate Synthetic Products (50 items)
    console.log('Generating products...');
    const products: any[] = [];
    for (let i = 1; i <= 50; i++) {
      const cost = randomInt(50, 1000);
      const margin = randomInt(10, 50) / 100;
      const sell = Math.round(cost * (1 + margin));

      const { rows } = await client.query(
        `INSERT INTO products (store_id, name, sku, category, cost_price, selling_price, stock_quantity, low_stock_threshold, unit, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          storeId,
          `Test Product ${i} (${randomEl(CATEGORIES)})`,
          `SKU-${10000 + i}`,
          randomEl(CATEGORIES),
          cost,
          sell,
          randomInt(10, 500),
          randomInt(5, 20),
          randomEl(UNITS),
          true
        ]
      );
      products.push(rows[0]);
    }
    console.log(`Created ${products.length} products.`);

    // 3. Generate Synthetic Customers (30 customers)
    console.log('Generating customers...');
    const customers: any[] = [];
    for (let i = 1; i <= 30; i++) {
      const { rows } = await client.query(
        `INSERT INTO customers (store_id, name, phone, email, address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          storeId,
          `Customer ${i}`,
          `+88017${randomInt(10000000, 99999999)}`,
          `customer${i}@example.com`,
          `Address ${i}, Dhaka`
        ]
      );
      customers.push(rows[0]);
    }
    console.log(`Created ${customers.length} customers.`);

    // 4. Generate Synthetic Orders (Past 6 months, ~500 orders)
    console.log('Generating orders and order items...');
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled', 'returned'];
    const sources = ['Online', 'In-Store', 'Facebook', 'Instagram'];

    let orderCount = 0;

    for (let i = 0; i < 500; i++) {
      const customer = randomEl(customers);

      // Random date in the last 180 days
      const daysAgo = randomInt(0, 180);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);

      // Select 1-5 random products
      const numItems = randomInt(1, 5);
      const selectedProducts = [];
      for (let j = 0; j < numItems; j++) {
        selectedProducts.push(randomEl(products));
      }

      // Calculate totals
      let subtotal = 0;
      const orderItemsToInsert = [];

      for (const p of selectedProducts) {
        const qty = randomInt(1, 3);
        const itemTotal = p.selling_price * qty;
        subtotal += itemTotal;

        orderItemsToInsert.push({
          productId: p.id,
          productName: p.name,
          unitPrice: p.selling_price,
          costPrice: p.cost_price,
          quantity: qty
        });
      }

      const deliveryCharge = randomInt(50, 150);
      const discount = randomInt(0, Math.floor(subtotal * 0.1)); // up to 10% discount
      const total = subtotal + deliveryCharge - discount;

      // Insert Order
      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (store_id, customer_id, order_number, status, source, total, delivery_charge, discount, notes, order_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
         RETURNING id`,
        [
          storeId,
          customer.id,
          `ORD-${Date.now()}-${randomInt(1000, 9999)}`,
          randomEl(statuses),
          randomEl(sources),
          total,
          deliveryCharge,
          discount,
          `Synthetic order notes ${i}`,
          orderDate,
          orderDate // overriding created_at for historical data
        ]
      );

      const orderId = orderRows[0].id;

      // Insert Order Items
      for (const item of orderItemsToInsert) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, cost_price, quantity, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            orderId,
            item.productId,
            item.productName,
            item.unitPrice,
            item.costPrice,
            item.quantity,
            orderDate
          ]
        );
      }

      orderCount++;
    }
    console.log(`Created ${orderCount} orders with their items.`);

    // Update Customer Aggregates
    console.log('Updating customer totals...');
    await client.query(`
      UPDATE customers c
      SET total_orders = (
            SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status != 'cancelled'
          ),
          total_spent = (
            SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.customer_id = c.id AND o.status != 'cancelled'
          )
      WHERE c.store_id = $1
    `, [storeId]);

    console.log('Customer totals updated.');

    // Generate some Expenses
    console.log('Generating expenses...');
    const expenseCategories = ['Rent', 'Utilities', 'Marketing', 'Salary', 'Supplies', 'Other'];
    for(let i = 0; i < 50; i++) {
      const daysAgo = randomInt(0, 180);
      const expenseDate = new Date();
      expenseDate.setDate(expenseDate.getDate() - daysAgo);

      await client.query(
        `INSERT INTO expenses (store_id, category, amount, expense_date, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          storeId,
          randomEl(expenseCategories),
          randomInt(500, 5000),
          expenseDate,
          `Synthetic expense ${i}`
        ]
      );
    }
    console.log('Generated 50 expenses.');

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    if (client) {
      client.release();
    }
    await db.end(); // close pool
  }
}

seed();