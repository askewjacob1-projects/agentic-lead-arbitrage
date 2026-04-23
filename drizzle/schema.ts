import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lead lists table - stores metadata about available lead lists
 */
export const leadLists = mysqlTable("lead_lists", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  leadCount: int("leadCount").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  csvFileKey: varchar("csvFileKey", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadList = typeof leadLists.$inferSelect;
export type InsertLeadList = typeof leadLists.$inferInsert;

/**
 * Orders table - tracks all lead list purchases
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  leadListId: int("leadListId").notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
  buyerName: varchar("buyerName", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  downloadedAt: timestamp("downloadedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order downloads table - tracks when buyers download their purchased CSVs
 */
export const orderDownloads = mysqlTable("order_downloads", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
});

export type OrderDownload = typeof orderDownloads.$inferSelect;
export type InsertOrderDownload = typeof orderDownloads.$inferInsert;

// Relations
export const leadListsRelations = relations(leadLists, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  leadList: one(leadLists, {
    fields: [orders.leadListId],
    references: [leadLists.id],
  }),
  downloads: many(orderDownloads),
}));

export const orderDownloadsRelations = relations(orderDownloads, ({ one }) => ({
  order: one(orders, {
    fields: [orderDownloads.orderId],
    references: [orders.id],
  }),
}));