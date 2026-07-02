import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('products', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    store_id: { type: 'uuid', notNull: true, references: '"stores"', onDelete: 'CASCADE' },
    name: { type: 'varchar(300)', notNull: true },
    name_bn: { type: 'varchar(300)' },
    sku: { type: 'varchar(100)' },
    category: { type: 'varchar(100)' },
    cost_price: { type: 'numeric(10,2)', notNull: true, default: 0 },
    selling_price: { type: 'numeric(10,2)', notNull: true },
    stock_quantity: { type: 'integer', notNull: true, default: 0 },
    low_stock_threshold: { type: 'integer', notNull: true, default: 10 },
    unit: { type: 'varchar(20)', notNull: true, default: 'pcs' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('products', 'store_id');
  pgm.createIndex('products', ['store_id', 'sku']);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('products');
}