import { mysqlTable, int, varchar, text } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  role_id: int('role_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  contact_no: varchar('contact_no', { length: 255 }),
  address: text('address'),
  blood_group: varchar('blood_group', { length: 10 }),
  work_experience: int('work_experience'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

