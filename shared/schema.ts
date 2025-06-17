import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNo: text("order_no").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerInitials: text("customer_initials").notNull(),
  items: text("items").notNull(),
  deliveryInfo: text("delivery_info"),
  paymentStatus: text("payment_status").notNull(),
  orderStatus: text("order_status").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  lastMessage: text("last_message").notNull(),
  time: text("time").notNull(),
  unreadCount: integer("unread_count").default(0),
  isOnline: boolean("is_online").default(false),
  platform: text("platform").notNull(), // "telegram" or "messenger"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  content: text("content").notNull(),
  isFromBot: boolean("is_from_bot").default(false),
  timestamp: text("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // "credit" or "debit"
  time: text("time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemStatus = pgTable("system_status", {
  id: serial("id").primaryKey(),
  botStatus: text("bot_status").notNull(),
  webhookStatus: text("webhook_status").notNull(),
  dbStatus: text("db_status").notNull(),
  apiStatus: text("api_status").notNull(),
  uptime: text("uptime").notNull(),
  version: text("version").notNull(),
  build: text("build").notNull(),
  environment: text("environment").notNull(),
  server: text("server").notNull(),
  region: text("region").notNull(),
  lastDeploy: text("last_deploy").notNull(),
  cpuUsage: integer("cpu_usage").notNull(),
  memoryUsage: integer("memory_usage").notNull(),
  diskUsage: integer("disk_usage").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertSystemStatusSchema = createInsertSchema(systemStatus).omit({
  id: true,
  updatedAt: true,
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type SystemStatus = typeof systemStatus.$inferSelect;
export type InsertSystemStatus = z.infer<typeof insertSystemStatusSchema>;
