import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Enable Row-Level Security on all store-scoped tables
  pgm.sql(`ALTER TABLE products ENABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE customers ENABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE orders ENABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE order_items ENABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE expenses ENABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE customer_rfm ENABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE categories ENABLE ROW LEVEL SECURITY`);

  // Create a function to extract store_id from the current setting
  pgm.sql(`
    CREATE OR REPLACE FUNCTION current_store_id()
    RETURNS uuid AS $$
      SELECT nullif(current_setting('app.current_store_id', true), '')::uuid;
    $$ LANGUAGE sql STABLE;
  `);

  // Products policies
  pgm.sql(`
    CREATE POLICY products_store_isolation ON products
      USING (store_id = current_store_id());
  `);

  // Customers policies
  pgm.sql(`
    CREATE POLICY customers_store_isolation ON customers
      USING (store_id = current_store_id());
  `);

  // Orders policies
  pgm.sql(`
    CREATE POLICY orders_store_isolation ON orders
      USING (store_id = current_store_id());
  `);

  // Order items policies (via order's store_id)
  pgm.sql(`
    CREATE POLICY order_items_store_isolation ON order_items
      USING (order_id IN (
        SELECT id FROM orders WHERE store_id = current_store_id()
      ));
  `);

  // Expenses policies
  pgm.sql(`
    CREATE POLICY expenses_store_isolation ON expenses
      USING (store_id = current_store_id());
  `);

  // Forecasts policies
  pgm.sql(`
    CREATE POLICY forecasts_store_isolation ON forecasts
      USING (store_id = current_store_id());
  `);

  // Inventory alerts policies
  pgm.sql(`
    CREATE POLICY inventory_alerts_store_isolation ON inventory_alerts
      USING (store_id = current_store_id());
  `);

  // Customer RFM policies
  pgm.sql(`
    CREATE POLICY customer_rfm_store_isolation ON customer_rfm
      USING (store_id = current_store_id());
  `);

  // Categories policies
  pgm.sql(`
    CREATE POLICY categories_store_isolation ON categories
      USING (store_id = current_store_id());
  `);

  // Create a helper function to set the current store context
  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_current_store_id(store_uuid uuid)
    RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.current_store_id', store_uuid::text, true);
      END;
    $$ LANGUAGE plpgsql;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop all policies
  pgm.sql(`DROP POLICY IF EXISTS products_store_isolation ON products`);
  pgm.sql(`DROP POLICY IF EXISTS customers_store_isolation ON customers`);
  pgm.sql(`DROP POLICY IF EXISTS orders_store_isolation ON orders`);
  pgm.sql(`DROP POLICY IF EXISTS order_items_store_isolation ON order_items`);
  pgm.sql(`DROP POLICY IF EXISTS expenses_store_isolation ON expenses`);
  pgm.sql(`DROP POLICY IF EXISTS forecasts_store_isolation ON forecasts`);
  pgm.sql(`DROP POLICY IF EXISTS inventory_alerts_store_isolation ON inventory_alerts`);
  pgm.sql(`DROP POLICY IF EXISTS customer_rfm_store_isolation ON customer_rfm`);
  pgm.sql(`DROP POLICY IF EXISTS categories_store_isolation ON categories`);

  // Drop helper functions
  pgm.sql(`DROP FUNCTION IF EXISTS current_store_id()`);
  pgm.sql(`DROP FUNCTION IF EXISTS set_current_store_id(uuid)`);

  // Disable RLS
  pgm.sql(`ALTER TABLE products DISABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE customers DISABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE orders DISABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE order_items DISABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE expenses DISABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE forecasts DISABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE inventory_alerts DISABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE customer_rfm DISABLE ROW LEVEL SECURITY`);
  pgm.sql(`ALTER TABLE categories DISABLE ROW LEVEL SECURITY`);
}
