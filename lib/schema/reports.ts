import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

                                                                                
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by"),
}, (table) => [
  index("reports_user_idx").on(table.userId, table.submittedAt),
]);
