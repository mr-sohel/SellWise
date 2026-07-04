import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('categories', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    store_id: { type: 'uuid', notNull: true, references: '"stores"', onDelete: 'CASCADE' },
    name: { type: 'varchar(100)', notNull: true },
    name_bn: { type: 'varchar(100)' },
    is_default: { type: 'boolean', notNull: true, default: false },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createConstraint('categories', 'uq_categories_store_name', {
    unique: ['store_id', 'name'],
  });

  pgm.createIndex('categories', 'store_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('categories');
}
