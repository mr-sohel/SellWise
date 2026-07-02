import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('expenses', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    store_id: { type: 'uuid', notNull: true, references: '"stores"', onDelete: 'CASCADE' },
    category: { type: 'varchar(100)', notNull: true },
    amount: { type: 'numeric(12,2)', notNull: true },
    expense_date: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('expenses', 'store_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('expenses');
}