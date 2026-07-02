import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Orders Table
  pgm.createTable('orders', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    store_id: { type: 'uuid', notNull: true, references: '"stores"', onDelete: 'CASCADE' },
    customer_id: { type: 'uuid', notNull: true, references: '"customers"', onDelete: 'RESTRICT' },
    order_number: { type: 'varchar(100)', notNull: true },
    status: { type: 'varchar(50)', notNull: true, default: 'pending' },
    source: { type: 'varchar(50)', notNull: true, default: 'manual' },
    total: { type: 'numeric(12,2)', notNull: true },
    delivery_charge: { type: 'numeric(10,2)', notNull: true, default: 0 },
    discount: { type: 'numeric(10,2)', notNull: true, default: 0 },
    notes: { type: 'text' },
    order_date: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    external_reference_id: { type: 'varchar(255)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('orders', 'store_id');
  pgm.createIndex('orders', 'customer_id');
  pgm.addConstraint('orders', 'uq_orders_store_ext_ref', {
    unique: ['store_id', 'external_reference_id'],
  });

  // Order Items Table
  pgm.createTable('order_items', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    order_id: { type: 'uuid', notNull: true, references: '"orders"', onDelete: 'CASCADE' },
    product_id: { type: 'uuid', notNull: true, references: '"products"', onDelete: 'RESTRICT' },
    product_name: { type: 'varchar(300)', notNull: true },
    unit_price: { type: 'numeric(10,2)', notNull: true },
    cost_price: { type: 'numeric(10,2)', notNull: true, default: 0 },
    quantity: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('order_items', 'order_id');
  pgm.createIndex('order_items', 'product_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('order_items');
  pgm.dropTable('orders');
}