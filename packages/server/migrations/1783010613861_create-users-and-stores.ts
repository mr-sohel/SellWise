import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Add UUID extension if not exists
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

  // Users Table
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    preferred_lang: { type: 'varchar(10)', notNull: true, default: 'en' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Stores Table
  pgm.createTable('stores', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'varchar(255)', notNull: true },
    name_bn: { type: 'varchar(255)' },
    currency: { type: 'varchar(10)', notNull: true, default: 'BDT' },
    timezone: { type: 'varchar(50)', notNull: true, default: 'Asia/Dhaka' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Store Members Table
  pgm.createTable('store_members', {
    store_id: { type: 'uuid', notNull: true, references: '"stores"', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    role: { type: 'varchar(50)', notNull: true }, // 'owner' or 'manager'
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('store_members', 'pk_store_members', {
    primaryKey: ['store_id', 'user_id'],
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('store_members');
  pgm.dropTable('stores');
  pgm.dropTable('users');
}