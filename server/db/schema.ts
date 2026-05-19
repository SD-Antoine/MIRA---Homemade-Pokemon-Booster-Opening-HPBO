import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const inventoryTable = sqliteTable('inventory', {
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  cardId: integer('card_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
}, (table) => [
  primaryKey({ columns: [table.userId, table.cardId] }),
]);
