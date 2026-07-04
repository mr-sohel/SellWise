import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn('stores', {
    business_type: { type: 'varchar(30)' },
    sales_channels: { type: 'text[]', default: '{}' },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn('stores', 'business_type');
  pgm.dropColumn('stores', 'sales_channels');
}
