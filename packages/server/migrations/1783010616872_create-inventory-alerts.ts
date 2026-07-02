import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('inventory_alerts', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    store_id: { type: 'uuid', notNull: true, references: '"stores"', onDelete: 'CASCADE' },
    product_id: { type: 'uuid', notNull: true, references: '"products"', onDelete: 'CASCADE' },
    alert_type: { type: 'varchar(50)', notNull: true },
    severity: { type: 'varchar(20)', notNull: true },
    message: { type: 'text', notNull: true },
    is_read: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('inventory_alerts', 'store_id');
  pgm.createIndex('inventory_alerts', 'product_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('inventory_alerts');
}