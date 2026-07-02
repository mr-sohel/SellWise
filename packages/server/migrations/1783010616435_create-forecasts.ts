import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('forecasts', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    store_id: { type: 'uuid', notNull: true, references: '"stores"', onDelete: 'CASCADE' },
    product_id: { type: 'uuid', notNull: true, references: '"products"', onDelete: 'CASCADE' },
    forecast_date: { type: 'timestamp', notNull: true },
    predicted_qty: { type: 'numeric(10,2)', notNull: true },
    lower_bound: { type: 'numeric(10,2)' },
    upper_bound: { type: 'numeric(10,2)' },
    model_used: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('forecasts', ['store_id', 'product_id', 'forecast_date']);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('forecasts');
}