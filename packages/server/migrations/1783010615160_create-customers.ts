import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('customers', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    store_id: { type: 'uuid', notNull: true, references: '"stores"', onDelete: 'CASCADE' },
    name: { type: 'varchar(255)', notNull: true },
    phone: { type: 'varchar(50)', notNull: true },
    email: { type: 'varchar(255)' },
    address: { type: 'text' },
    total_orders: { type: 'integer', notNull: true, default: 0 },
    total_spent: { type: 'numeric(12,2)', notNull: true, default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Unique constraint for upsert
  pgm.addConstraint('customers', 'uq_customers_store_phone', {
    unique: ['store_id', 'phone'],
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('customers');
}