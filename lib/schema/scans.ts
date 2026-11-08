import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";

   
                                                                             
                                                                           
                                                                           
   
export const scans = pgTable("scans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  url: text("url").notNull(),
  hostname: text("hostname").notNull(),
  deepScan: boolean("deep_scan").notNull().default(false),
  status: text("status").notNull().default("queued"),
  phase: text("phase").notNull().default("Investigation queued"),
  threatRisk: integer("threat_risk"),
  verdict: text("verdict"),
  confidence: text("confidence"),
  securityGrade: text("security_grade"),
  explanation: text("explanation"),
  nextActions: jsonb("next_actions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
  index("scans_user_recent_idx").on(table.userId, table.createdAt),
]);
