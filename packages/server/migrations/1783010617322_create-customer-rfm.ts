import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('customer_rfm', {
    customer_id: { type: 'uuid', primaryKey: true, references: '"customers"', onDelete: 'CASCADE' },
    store_id: { type: 'uuid', notNull: true, references: '"stores"', onDelete: 'CASCADE' },
    recency_score: { type: 'integer', notNull: true },
    frequency_score: { type: 'integer', notNull: true },
    monetary_score: { type: 'integer', notNull: true },
    segment: { type: 'varchar(50)', notNull: true },
    churn_probability: { type: 'numeric(5,4)' },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('customer_rfm', 'store_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('customer_rfm');
}